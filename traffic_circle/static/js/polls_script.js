document.addEventListener('DOMContentLoaded', () => {
    // console.log(votesFromTemplate);
    var topicIdArray = topicIdArrayFromTemplate;
    var questionIdArray = questionIdArrayFromTemplate;

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
            console.log(`voted for ${messageForId}`)
        }
    })


    
    // Uses browser cookies to remember the topic that user last selected. Default: "All" button.
    if (localStorage.getItem('checkedButton') == undefined) {
        localStorage.setItem('checkedButton', 't-All')
    }


    document.querySelectorAll('.btn-topic').forEach(button => {

        button.onchange = function() {

            showHideQuestion(button);

            localStorage.setItem('checkedButton', button.id);
            // window.location.reload()
            questionIdArray.forEach(idText => {
                var questionId = parseInt(idText);

                // Allow browser to remember the disabled states of each question.
                var disabledState = localStorage.getItem(`.question-${questionId}-disabled`);
                $(`.question-${questionId}`).prop('disabled',disabledState);
                
                // Display survey result for this question.
                if (disabledState) {
                    // storeCollapseState(idText);
                    storeDisabledState(idText);
                }
            });
        };
    })


    // Keep the previously clicked-on button checked after page reloading.
    var checkedButtonId = `${localStorage.getItem('checkedButton')}`
    $(`#${checkedButtonId}`).trigger('click');
    // document.getElementById(localStorage.getItem('checkedButton')).click();
    document.getElementById(`input-${checkedButtonId}`).checked = true;

    // // Under the clicked topic button, show only the corresponding questions under the topic.
    document.querySelectorAll('.btn-topic').forEach(button => {
        if (document.getElementById(`input-${button.id}`).checked) {
            // console.log(`${button.id} was checked`)
            showHideQuestion(button);
        }
    })



    // Show or hide questions based on the t-id of given topic button
    function showHideQuestion(button) {
        var inputValue = button.dataset.topic;
        var targetBox = $("." + inputValue); 
        $(".topic-select").not(targetBox).hide(); 
        $(targetBox).show();
    }

    questionIdArray.forEach(idText => {
        storeCollapseState(idText);
        storeDisabledState(idText);
    });

    function storeDisabledState(idText) {
        var questionId = parseInt(idText);
        // Allow browser to remember the disabled states of each question.
        var disabledState = localStorage.getItem(`.question-${questionId}-disabled`);
        $(`.question-${questionId}`).prop('disabled',disabledState);
        
        // Display survey result for this question.
        if (disabledState) {
            topicIdArray.forEach(topic => {
                if ($(`.${topic}`).is(':visible')
                    && (document.getElementById(`${topic}-question-${questionId}`) != null)
                    && ((document.getElementById(`${topic}-question-${questionId}`) != undefined))) {
                    
                    if ($(`#${topic}-card-q-${questionId}`).is(':visible')) {
                        $(`#${topic}-card-q-${questionId}`).hide();
                    }
                    createResultDiv(questionId, topic);
                }
            })
        }
    }

    function createResultDiv(questionId, topic) {
        if ((document.getElementById(`${topic}-card-r-${questionId}`) != undefined)
            || (document.getElementById(`${topic}-card-r-${questionId}`) != null)) {
                document.getElementById(`${topic}-card-r-${questionId}`).remove();
            }
        const resultDiv = document.createElement('div');
        resultDiv.className = 'card card-body result-col';
        resultDiv.setAttribute('id', `${topic}-card-r-${questionId}`);
        var collapseElement = document.getElementById(`${topic}-q-choices-${questionId}`);
        collapseElement.appendChild(resultDiv);
        showChartOnDisplay(questionId, topic);
    }
    

    // Return an array that contains pairs of choice text and votes for the given question.
    async function getResultChartData(questionId) {
        const resultChartData = 
            await fetchResultData(questionId).then(data => {
                return data;
            })
        return resultChartData;

    }

    async function fetchResultData(questionId) {
        const resultData = await 
        fetchRawResult(questionId)
        .then(data => {
            return data;
        })
        return resultData;
    }

    async function fetchRawResult(questionId) {
        var totalVote = 0;
        var resultChartData = [
            ['Choice', 'Vote'],
        ];
        const response = await fetch(`/polls/results/${questionId}`);
        const data = await response.json();
        totalVote = await JSON.parse(data.choices).map(choice => choice.fields.votes).reduce((sum, vote) => sum + vote);

        await JSON.parse(data.choices).forEach(dataItem => {
            addResult(dataItem, totalVote, resultChartData);
        })
        return resultChartData;
    }

    // Add survey result of each choice to the array for the entire question.
    function addResult(data, totalVote, resultChartData) {
        var dataPair = [];
        dataPair.push((((`${data.fields.votes}`)/totalVote * 100).toFixed(0) + '%' + "\t" ) + `${data.fields.choice_text}`);
        dataPair.push(parseInt(`${data.fields.votes}`));
        resultChartData.push(dataPair);
    }
    

    function showChartOnDisplay(questionId, topic) {
        // Load google charts
        getResultChartData(questionId)
        .then(response => {
            var resultChartData = response;
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(() => {
                drawChart(questionId, topic, resultChartData);
            });
        }

        )


    }


    // Store the states of collapsible elements in browser's local storage.
    // Allow browser to restore collapse state after refreshing or reloading.
    function storeCollapseState(idText) {
        var questionId = parseInt(idText);

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

    // Draw the chart and set the chart values
    function drawChart(questionId, topic, resultChartData) {
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

        var chart = new google.visualization.BarChart(document.getElementById(`${topic}-card-r-${questionId}`));
        google.visualization.events.addListener(chart, 'error', function (err) {
            // check error
        console.log(err.id, err.message);
        });
        chart.draw(data, options);
    }
    
});

