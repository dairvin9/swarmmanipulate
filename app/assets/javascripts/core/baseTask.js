/*
 * baseTask.js -- Base task class for the SwarmControl manipulation app.
 * Copyright 2013 Chris Ertel, Aaron Becker
 *
 * NOTES:
 * This is the base class from which all other tasks are descended.
 *
 * This provides the basic run, update, and draw loop, and defers to
 * subclass methods to actually implement behavior.
 *
 * To make a new task, you extend this via _.extend() and override the
 * setupGoals, setupRobots, setupProps, and evaluateCompletion functions.
 *
 * USAGE:
 * var mytask = new myTask(); // assume myTask extends baseTask
 * mytask.init( { $canvas: $("#canvas") } );    // assume #canvas is where to draw
 *
 */

 function open_close(){
    var txt = $("button.open_one").text();
    if(txt === "read more"){                  
        $("p.less").removeClass("less").addClass("more");
        $("button.open_one").text("close");                            
    }
    else
    {
        $("p.more").removeClass("more").addClass("less");
        $("button.open_one").text("read more");
    }  
  }


var baseTask = {
    taskName: "base task",
    taskMode: "",
    shownNotice: false,
    instructions: "Default instructions.",
    theScience: "Default Science.",

    firstKeyPressed : false,
    isTaskComplete : false,
    keyL: null,
    keyR: null,
    keyU: null,
    keyD: null,

    /*
     * Function to setup the task.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    setupTask: function( options ) {
    },

    /*
     * Function to evaluate whether or not a task has been completed.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    evaluateCompletion: function( options ) {
        return false;
    },

    /* 
     * Function to handle drawing the simulation.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    draw: function( options ) {
    },

    /*
     * Function to handle updating the simulation.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    update: function( options ) {
    },

    _runtime: 0,
    _startTime: null,

    /*
     * Function to initialize and begin the task.
     * This generally SHOULD NOT be overridden.
     * @param options -- object of options to pass.
     *
     *                   Other options depend on the subclass.
     */
    init: function( options ) {
        this._options = options;

        // setup the draw utilities
        drawutils.init();

        // setup the simulation
        this.setupTask( this._options );

        // register the handlers
        this.setupController( this._options );



        // add instructions to the page
        $("#task-instructions").empty();
        $("#task-instructions").append( $( "<h4>How to play</h4><p>" + this.instructions + "<p>") );

        // add science to the page

        $("#task-theScience").empty();
        $("#task-theScience").append( $( "<h4>The Science</h4><p>" 
            + this.theScience //+ '<p> <div class="slide" style="cursor: pointer; text-align:center"><a href>  More &#8661; Less</a></div>'
            ) );

        // add the task mode
        if( this.taskMode != "default"){
            $("#taskMode").empty();
            $("#taskMode").append( $( "<strong>Mode: </strong><span>" + this.taskMode + "</span>") );
        }


        // do the loop
        requestAnimFrame( this._update );
    },

    /*
     * Function to run the simulation.
     * This generally SHOULD NOT be overridden.
     */
    _update: function( ) {
        // step the simulation
        // TODO: Have the update run multiple times if the delay incurred by 
        // requestAnimFrame is greater than 60hz.
        this.update( this._options );

        // draw the simulation
        this.draw( this._options );

        // render the task time
    	string = "<strong>Time:</strong> " + (this._runtime).toFixed(2) + "s";
        $('#taskFeedback').html(string);
        // check to see if we've reached completion.
        if ( this.isTaskComplete == false && this.evaluateCompletion( this._options ) ) {
            // if so, post our results to the server.
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, mode:this.taskMode, runtime:this._runtime, numrobots:this._numrobots, participant:"web"}
            });
            this.isTaskComplete = true;
            // draw seethrough grey box
            drawutils.drawRect(300,300, 590,590, "rgba(200, 200, 200, 0.8)");
            var color = "green";
            drawutils.drawText(300,250, "Task completed in "+ (this._runtime).toFixed(2) +" seconds!", 2, color, color)
            //TODO: display buttons for restart and show results
            // at this point, we do not reschedule, and the task ends.

            $.get("/result.json?task="+this.taskName, function( data ) {
                console.log(data);
                var c = $("#span8");
                swarmcontrol.results.init(c,data.results);
            });






            return;
        } else {
            // if not, schedule ourselves again and update the time.
            // Mr. Bones says, "The ride never ends!"
            requestAnimFrame( this._update );
	    if( this._startTime == null)
               this._runtime = 0.00;
	    else
               this._runtime = (new Date().getTime() - this._startTime)/1000.0;
        }

    }
};

