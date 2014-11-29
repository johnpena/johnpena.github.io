require 'goodreads'
require 'yaml'
require 'json'
require 'pry'


def get_api_keys()
    YAML.load_file(ENV['HOME'] + "/.apikeys")
end


def get_goodreads_books(api_key, api_secret, user_id)

    goodreads = Goodreads::Client.new(
        :api_key => api_key,
        :api_secret => api_secret
    )

    read_books = goodreads.shelf(
        user_id,
        'read',
        {:per_page => 200}
    )

    read_books = read_books.books.map do |book|
        unless book.read_at.nil?
            if book.read_at.include? "2014"
                entry = {
                    :date_read => book.read_at,
                    :title => book.book.title,
                    :author => book.book.authors.author.name,
                    :link => book.link
                }
                entry
            end
        end
    end

    read_books.compact
end


def get_strava_runs()
    []
end


def get_workouts()
    []
end


#############################################

task :default do
    puts "Validating ~/.apikeys"
    puts get_api_keys.inspect
end


task :generate_json do

    out = {}

    puts "Reading ~/.apikeys"
    secrets = get_api_keys

    puts "Scraping goodreads"
    out[:books] = get_goodreads_books(
        secrets['goodreads']['api_key'],
        secrets['goodreads']['secret_key'],
        secrets['goodreads']['user_id'],
    )

    puts "Scraping strava"
    out[:runs] = get_strava_runs

    puts "Scraping workouts spreadsheet"
    out[:workouts] = get_workouts

    puts "Writing out to 2015.json"
    outfile = Dir.pwd + "/2015.json"
    puts outfile
    File.delete(outfile) if File.exist?(outfile)
    File.open(outfile, "w") do |f|
        f.write(out.to_json)
    end

end
