# Ruby backend in Sinatra

@rmontgomery429 has provided this sample implementation in ruby.

1. This is constructed here as a modular sinatra app but you app does not necessarily need to be modular.
2. I've included the use of the sinatra-cross_origin gem which we required for our use case. Your use case may be different and this may not be required.
3. I have not tested this specific gist of the app, but we do have a version of this tested and working in production.
4. This solution does not take into account any kind of file.io race conditions or any other permissions issues. 
5. I provided this as a reference example not as copy/paste production ready code. Your mileage may vary. :)

The basic idea is that you capture chunks of files, save them as part1, part2, partN, and when you've recieved all the files you combine them into the final single file.

```ruby
##
# Gemfile
gem 'sinatra', '~> 1.4.5'
gem 'sinatra-cross_origin', '~> 0.3.1'

##
# config.ru
require 'sinatra'
set :root, File.dirname(__FILE__)

require './flow_app'
require './flow_controller'

get '/' do
  404
end

run Rack::URLMap.new(
  "/" => Sinatra::Application,
  "/flow" => FlowApp.new,
)

##
# flow_app.rb
class FlowApp < Sinatra::Base
  register Sinatra::CrossOrigin

  get "/" do
    cross_origin
    FlowController.new(params).get
  end

  post "/" do
    cross_origin
    FlowController.new(params).post!
  end

  options "/" do
    cross_origin
    200
  end
end

##
# flow_controller.rb
class FlowController
  attr_reader :params

  def initialize(params)
    @params = params
  end

  def get
    File.exists?(chunk_file_path) ? 200 : 204
  end

  def post!
    save_file!
    combine_file! if last_chunk?
    200
  rescue
    500
  end

private

  ##
  # Move the temporary Sinatra upload to the chunk file location
  def save_file!
    # Ensure required paths exist
    FileUtils.mkpath chunk_file_directory
    # Move the temporary file upload to the temporary chunk file path
    FileUtils.mv params['file'][:tempfile], chunk_file_path, force: true
  end

  ##
  # Determine if this is the last chunk based on the chunk number.
  def last_chunk?
    params[:flowChunkNumber].to_i == params[:flowTotalChunks].to_i
  end

  ##
  # ./tmp/flow/abc-123/upload.txt.part1
  def chunk_file_path
    File.join(chunk_file_directory, "#{params[:flowFilename]}.part#{params[:flowChunkNumber]}")
  end

  ##
  # ./tmp/flow/abc-123
  def chunk_file_directory
    File.join "tmp", "flow", params[:flowIdentifier]
  end

  ##
  # Build final file
  def combine_file!
    # Ensure required paths exist
    FileUtils.mkpath final_file_directory
    # Open final file in append mode
    File.open(final_file_path, "a") do |f|
      file_chunks.each do |file_chunk_path|
        # Write each chunk to the permanent file
        f.write File.read(file_chunk_path)
      end
    end
    # Cleanup chunk file directory and all chunk files
    FileUtils.rm_rf chunk_file_directory
  end

  ##
  # /final/resting/place/upload.txt
  def final_file_path
    File.join final_file_directory, params[:flowFilename]
  end

  ##
  # /final/resting/place
  def final_file_directory
    File.join "", "final", "resting", "place"
  end

  ##
  # Get all file chunks sorted by cardinality of their part number
  def file_chunks
    Dir["#{chunk_file_directory}/*.part*"].sort_by {|f| f.split(".part")[1].to_i }
  end
end
```
