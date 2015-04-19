# Backend in Go

## Libraries
 * http://godoc.org/github.com/patdek/gongflow
 * https://github.com/stuartnelson3/golang-flowjs-upload

## Example 
1. A `GET` request is sent to see if a chunk exists on disk. If it isn't found, the chunk is uploaded.
2. Each `POST` request is parsed and then saved to disk.
3. After the final chunk is uploaded, the chunks are stitched together in a separate go routine.
4. The chunks are deleted.

This implementation assumes that the final chunk is the last piece of the file being uploaded.

Full working code available at https://github.com/stuartnelson3/golang-flowjs-upload

The above repo includes an additional handler that streams the `POST` request chunks to disk, lowering the overall memory footprint.

```go
package main

import (
	"bytes"
	"github.com/codegangsta/martini"
	"github.com/codegangsta/martini-contrib/render"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
)

var completedFiles = make(chan string, 100)

func main() {
	for i := 0; i < 3; i++ {
		go assembleFile(completedFiles)
	}

	m := martini.Classic()
	m.Use(render.Renderer(render.Options{
		Layout:     "layout",
		Delims:     render.Delims{"{[{", "}]}"},
		Extensions: []string{".html"}}))

	m.Get("/", func(r render.Render) {
		r.HTML(200, "index", nil)
	})

	m.Post("/upload", streamHandler(chunkedReader))
	m.Get("/upload", continueUpload)

	m.Run()
}

type ByChunk []os.FileInfo

func (a ByChunk) Len() int      { return len(a) }
func (a ByChunk) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByChunk) Less(i, j int) bool {
	ai, _ := strconv.Atoi(a[i].Name())
	aj, _ := strconv.Atoi(a[j].Name())
	return ai < aj
}

type streamHandler func(http.ResponseWriter, *http.Request) error

func (fn streamHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if err := fn(w, r); err != nil {
		http.Error(w, err.Error(), 500)
	}
}

func continueUpload(w http.ResponseWriter, r *http.Request) {
	chunkDirPath := "./incomplete/" + r.FormValue("flowFilename") + "/" + r.FormValue("flowChunkNumber")
	if _, err := os.Stat(chunkDirPath); err != nil {
		w.WriteHeader(204)
		return
	}
}

func chunkedReader(w http.ResponseWriter, r *http.Request) error {
	r.ParseMultipartForm(25)

	chunkDirPath := "./incomplete/" + r.FormValue("flowFilename")
	err := os.MkdirAll(chunkDirPath, 02750)
	if err != nil {
		return err
	}

	for _, fileHeader := range r.MultipartForm.File["file"] {
		src, err := fileHeader.Open()
		if err != nil {
			return err
		}
		defer src.Close()

		dst, err := os.Create(chunkDirPath + "/" + r.FormValue("flowChunkNumber"))
		if err != nil {
			return err
		}
		defer dst.Close()
		io.Copy(dst, src)

		fileInfos, err := ioutil.ReadDir(chunkDirPath)
		if err != nil {
			return err
		}

		cT, err := strconv.Atoi(chunkTotal)
		if err != nil {
			return err
		}
		if len(fileInfos) == cT {
			completedFiles <- chunkDirPath
		}
	}
	return nil
}

func assembleFile(jobs <-chan string) {
	for path := range jobs {
		fileInfos, err := ioutil.ReadDir(path)
		if err != nil {
			return
		}

		// create final file to write to
		dst, err := os.Create(strings.Split(path, "/")[2])
		if err != nil {
			return
		}
		defer dst.Close()

		sort.Sort(ByChunk(fileInfos))
		for _, fs := range fileInfos {
			src, err := os.Open(path + "/" + fs.Name())
			if err != nil {
				return
			}
			defer src.Close()
			io.Copy(dst, src)
		}
		os.RemoveAll(path)
	}
}
```
