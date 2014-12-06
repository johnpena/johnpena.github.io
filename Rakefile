require 'goodreads'
require 'yaml'
require 'json'
require 'pry'
require 'strava/api/v3'
require 'colorize'


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
                    :date => book.read_at,
                    :title => book.book.title,
                    :author => book.book.authors.author.name,
                    :link => book.link
                }
                entry
            end
        end
    end.compact

    read_books
end


def get_strava_runs(access_token)

    strava = Strava::Api::V3::Client.new(:access_token => access_token)

    runs = strava.list_athlete_activities.map do |activity|
        if activity["type"] == "Run" and activity["start_date_local"].include? "2014"
            run = {
                :distance => activity["distance"] * 0.000621371, # (meters to miles)
                :date => activity["start_date_local"],
                :total_time => activity["elapsed_time"] / 60,
                :link => "http://www.strava.com/" + activity["id"].to_s
            }
            run
        end
    end

    runs.compact
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

    print "Reading ~/.apikeys... ".blue
    secrets = get_api_keys
    puts "Done".green

    print "Scraping goodreads... ".blue
    out[:books] = get_goodreads_books(
        secrets['goodreads']['api_key'],
        secrets['goodreads']['secret_key'],
        secrets['goodreads']['user_id'],
    )
    puts "Done".green

    print "Scraping strava... ".blue
    out[:runs] = get_strava_runs(secrets['strava']['access_token'])
    puts "Done".green

    print "Scraping workouts spreadsheet... ".blue
    out[:workouts] = get_workouts
    puts "Done".green

    outfile = Dir.pwd + "/2014.json"
    print "Writing out to #{outfile}... ".blue
    File.delete(outfile) if File.exist?(outfile)
    File.open(outfile, "w") do |f|
        f.write(out.to_json)
    end
    puts "Done".green

end
