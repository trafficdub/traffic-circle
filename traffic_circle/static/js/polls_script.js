document.addEventListener('DOMContentLoaded', () => {
    // Uses browser cookies to remember the question that user last voted for.
    var lastVotedFor = -1;
    document.querySelectorAll('.vote-button').forEach(button => {
        button.onclick = function() {
            lastVotedFor = parseInt(button.dataset.questionid);
            lastVotedForSection = button.dataset.section;
            localStorage.setItem('lastVotedFor', lastVotedFor)
            localStorage.setItem('lastVotedForSection', lastVotedForSection)
        };
    })


    // Display success or warning messages based on whether voting was successful.
    var messageArray = messageList;
    var messageTag = '';
    messageArray.forEach(message => {
        var messageForId = localStorage.getItem('lastVotedFor');
        var messageForSection = localStorage.getItem('lastVotedForSection')
        var tag = message[0];
        messageTag = tag;
        var content = message[1];
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${tag}`;
        messageDiv.innerHTML = `${content}`;
        var questionElement = document.getElementById(`${messageForSection}-question-${messageForId}`)
        // var cardElement = document.getElementById(`card-q-${messageForId}`)
        // cardElement.insertBefore(messageDiv, cardElement.childNodes[0]);
        questionElement.appendChild(messageDiv);
        if (tag === 'success') {
            $(`.question-${messageForId}`).prop('disabled',true);
            localStorage.setItem(`.question-${messageForId}-disabled`, true);
        }
    })

    
    // Uses browser cookies to remember the topic that user last selected.
    if (localStorage.getItem('checkedButton') == undefined) {
        localStorage.setItem('checkedButton', 't-All')
    }

    var checkedButtonId = `${localStorage.getItem('checkedButton')}`
    document.getElementById(localStorage.getItem('checkedButton')).click();
    document.getElementById(`input-${checkedButtonId}`).checked = true;

    document.querySelectorAll('.btn-topic').forEach(button => {
        if (document.getElementById(`input-${button.id}`).checked) {
            // console.log(`${button.id} was checked`)
            showHideQuestion(button);
        }
    })



    document.querySelectorAll('.btn-topic').forEach(button => {
        button.onclick = function() {
            localStorage.setItem('checkedButton', this.id);
            // console.log(`${localStorage.getItem('checkedButton')} was clicked on`)
            showHideQuestion(button);
            window.location.reload()
        };
    })

    // Show or hide questions based on the id of given topic button
    function showHideQuestion(button) {
        var inputValue = button.dataset.topic;
        // console.log(inputValue);
        var targetBox = $("." + inputValue); 
        $(".topic-select").not(targetBox).hide(); 
        $(targetBox).show();
    }

    // Store the states of collapsible elements in browser's local storage.
    // Allow browser to restore collapse state after refreshing or reloading.
    var topicIdArray = topicIdArrayFromTemplate;
    var questionIdArray = questionIdArrayFromTemplate;

    questionIdArray.forEach(idText => {
        var questionId = parseInt(idText);
        storeCollapseState(questionId);
    });
    
    function storeCollapseState(questionId) {
        // Allow browser to remember the disabled states of each question.
        var disabledState = localStorage.getItem(`.question-${questionId}-disabled`);
        $(`.question-${questionId}`).prop('disabled',disabledState);
        
        var resultChartData = [
            ['Choice', 'Vote'],
        ];

        
        // Display survey result for this question.
        if (disabledState) {
            getResult(questionId);
            topicIdArray.forEach(topic => {
                
                if ((document.getElementById(`${topic}-card-q-${questionId}`) != null) && (document.getElementById(`${topic}-question-${questionId}`) != null)) {
                    // console.log(topic);
                    document.getElementById(`${topic}-card-q-${questionId}`).display = 'block';
                    document.getElementById(`${topic}-q-choices-${questionId}`).display = 'block';
                    // console.log(resultChartData);
                    // Load google charts
                    
                    console.log(`${topic}-${questionId} is being modifed`)
                    google.charts.load('current', {'packages':['corechart']});
                    google.charts.setOnLoadCallback(() => {
                        drawChart(topic);
                    });
                }

            })
        }

        var totalVote = 0;
        // Retrieve choice text and votes data of given question ID in JSON format
        function getResult(questionId) {
            fetch(`/polls/results/${questionId}`)
            .then(response => response.json()
            )
            .then(data => {
                totalVote = JSON.parse(data.choices).map(choice => choice.fields.votes).reduce((sum, vote) => sum + vote);
                JSON.parse(data.choices).forEach(addResult);
            });

        }

        // Display survey results under question text
        function addResult(data) {
            var dataPair = [];
            dataPair.push((((`${data.fields.votes}`)/totalVote * 100).toFixed(0) + '%' + "\t" ) + `${data.fields.choice_text}`);
            dataPair.push(parseInt(`${data.fields.votes}`));
            resultChartData.push(dataPair);

        }


        // Draw the chart and set the chart values
        function drawChart(topic) {
            console.log(resultChartData);
            console.log(`${topic} and ${questionId} chart`);
            var width = (document.getElementById(`${topic}-question-${questionId}`).offsetWidth) * 0.6;
            var data = google.visualization.arrayToDataTable(
                resultChartData
            );
            var options = {
            chartArea:{left: 5, width:'100%', height:'75%'},
            width: width,
            colors: ['#d9e6ef'],
            bar: {
                groupWidth: '60%'
            },
            hAxis: {
                textPosition: 'none',
                minValue: 0,
                format: '#',
                minorGridlines: {
                    color: 'transparent',
                },
                gridlines: {
                    color: 'transparent',
                }
            },
            vAxis: {
                textPosition: 'in',
                textStyle: {
                    color: 'black',
                    auraColor: 'transparent',
                    bold: 'true'
                }
            },
            legend: {
                position: 'none'
            }
            };

            var chart = new google.visualization.BarChart(document.getElementById(`${topic}-card-q-${questionId}`));

            chart.draw(data, options);
        }

        $(`.collapse-${questionId}`).on('shown.bs.collapse', function () {
            var active = $(this).attr('id');
            var panels = localStorage.panels === undefined ? new Array() : JSON.parse(localStorage.panels);
            if ($.inArray(active,panels)==-1) //check that the element is not in the array
            panels.push(active);
            localStorage.panels=JSON.stringify(panels);
        });
        
        $(`.collapse-${questionId}`).on('hidden.bs.collapse', function () {
            var active = $(this).attr('id');
            var panels = localStorage.panels === undefined ? new Array() : JSON.parse(localStorage.panels);
            var elementIndex=$.inArray(active,panels);
            if (elementIndex!==-1) //check the array
            {        
                panels.splice(elementIndex,1); //remove item from array
            }
            localStorage.panels=JSON.stringify(panels); //save array on localStorage
        });

        var panels=localStorage.panels === undefined ? new Array() : JSON.parse(localStorage.panels); //get all panels
            for (var i in panels) { //<-- panel is the name of the cookie
                if ($("#"+panels[i]).hasClass('collapse')) {
                    // check if this is a panel
                    $("#"+panels[i]).collapse("show");
                } 
            }
    }
    
});

