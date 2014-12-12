(function () {

    // helpers
    ///////////
    function getShortDateFormat(dateString) {
        var d = new Date(dateString);
        var dateFormatted = (d.getMonth() + 1) + "/" + d.getDate();

        return dateFormatted;
    }

    function getRoundedNumber(number) {
        return Math.round(number * 100) / 100;
    }

    function dateComparator(a, b) {
        var aDate = new Date(a.props.data.date);
        var bDate = new Date(b.props.data.date);

        if (aDate < bDate) {
            return -1;
        } else if (aDate > bDate) {
            return 1;
        }

        return 0;
    }

    var bottomMarginStyle = {
        marginBottom: '10px'
    };

    var topMarginStyle = {
        marginTop: '10px'
    };


    // the basics
    ///////////////
    var Book = React.createClass({
        render: function () {
            var link = this.props.data.link,
                title = this.props.data.title,
                author = this.props.data.author,
                date = getShortDateFormat(this.props.data.date);

            return (
                <div className="book" style={bottomMarginStyle}>
                    <a href={link}>
                        {title}
                    </a> by {author}
                    <br />
                    Finished on {date}
                </div>
            );
        }
    });

    var Run = React.createClass({
        render: function () {
            var distance = getRoundedNumber(this.props.data.distance),
                time = getRoundedNumber(this.props.data.total_time),
                date = getShortDateFormat(this.props.data.date),
                link = this.props.data.link;

            return (
                <div className="run" style={bottomMarginStyle}>
                    <a href={link}>Ran {distance} miles</a> in {time} minutes on {date}.
                </div>
            );
        }
    });

    var Workout = React.createClass({
        render: function () {
            return (
                <div></div>
            );
        }
    });


    // meta-things
    /////////////////
    var BookList = React.createClass({
        render: function () {
            var bookNodes = this.props.data.map(function (book) {
                return (
                    <Book data={book} />
                );
            });

            bookNodes.sort(dateComparator);

            return (
                <div className="bookList row">
                    <div className="col-sm-3">
                        <h4> Books </h4>
                        ({bookNodes.length} of 25)
                    </div>
                    <div className="col-sm-9" style={topMarginStyle}>
                        {bookNodes}
                    </div>
                    <hr />
                </div>
            );
        }
    });


    var RunList = React.createClass({
        componentDidMount: function () {
            var totalDistance = this.getTotalDistance();
            var goal = 400;
            var data = [
                {
                    value: totalDistance,
                    color:"#F7464A",
                    highlight: "#FF5A5E",
                    label: "Distance Covered"
                },
                {
                    value: goal - totalDistance,
                    color: "#46BFBD",
                    highlight: "#5AD3D1",
                    label: "Uncovered"
                },
            ]
            var context = document.getElementById("runListChart").getContext("2d");
            var runListChart = new Chart(context).Pie(data, {});
        },

        getTotalDistance: function () {
            var totalDistance = this.props.data.reduce(function (total, run) {
                return total + run.distance;
            }, 0);

            totalDistance = getRoundedNumber(totalDistance);
            return totalDistance;
        },

        render: function () {
            var runNodes = this.props.data.map(function (run) {
                return (
                    <Run data={run} />
                );
            });

            var totalDistance = this.getTotalDistance();

            return (
                <div className="runList row">
                    <div className="col-sm-3">
                        <h4> Runs </h4>
                        ({totalDistance} of 400 miles)
                        <canvas id="runListChart" width="150" height="150"></canvas>
                    </div>
                    <div className="col-sm-9" style={topMarginStyle}>
                        {runNodes}
                    </div>
                </div>
            );
        }
    });



    // meta-meta-thing
    ////////////////////
    var ProgressLists = React.createClass({

        getInitialState: function () {
            return { data: { books: [], runs: [], workouts: []  } };
        },

        loadDataFromServer: function () {

            $.ajax({
                url: this.props.url,
                dataType: 'json',
                success: function (data) {
                    this.setState({data: data});
                }.bind(this),
                error: function (xhr, status, error) {
                    console.error(this.props.url, status, error.toString());
                }.bind(this)
            });

        },

        componentDidMount: function () {
            this.loadDataFromServer();
        },

        render: function () {
            return (
                <div className="progressLists">
                    <h3> Progress </h3>
                    <BookList data={this.state.data.books} />
                    <hr />
                    <RunList data={this.state.data.runs} />
                </div>
            );
        }
    });

    // put the pieces back together, rediscover communication
    React.render(
        <ProgressLists url="2014.json" />,
        document.getElementById("progress")
    );

}).call(this);
