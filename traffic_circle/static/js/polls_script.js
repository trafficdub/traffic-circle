
document.addEventListener('DOMContentLoaded', () => {
    // Uses browser cookies to remember the question that user last voted for.
    var lastVotedFor = -1;
    document.querySelectorAll('.vote-button').forEach(button => {
        button.onclick = function() {
            lastVotedFor = parseInt(button.dataset.questionid);
            localStorage.setItem('lastVotedFor', lastVotedFor)
        };
    })

    if (localStorage.getItem('checkedButton') == undefined) {
        localStorage.setItem('checkedButton', 't-All')
    }

    var checkedButtonId = `${localStorage.getItem('checkedButton')}`
    // console.log(`saved var is ${checkedButtonId}`)
    // console.log(document.getElementById(`${checkedButtonId}`));
    document.getElementById(localStorage.getItem('checkedButton')).click();
    document.getElementById(`input-${checkedButtonId}`).checked = true;
    // console.log(`${checkedButtonId} is checked`);
    // console.log(document.getElementById(`input-${checkedButtonId}`).checked);
    // console.log(document.getElementById(`${checkedButtonId}`).checked);

    document.querySelectorAll('.btn-topic').forEach(button => {
        if (document.getElementById(`input-${button.id}`).checked) {
            console.log(`${button.id} was checked`)
            showHideQuestion(button);
        }
    })
    document.querySelectorAll('.btn-topic').forEach(button => {
        button.onclick = function() {
            localStorage.setItem('checkedButton', this.id);
            console.log(`${localStorage.getItem('checkedButton')} was clicked on`)
            showHideQuestion(button);
        };
    })

    // Show or hide questions based on the id of given topic button
    function showHideQuestion(button) {
        var inputValue = button.dataset.topic;
        console.log(inputValue);
        var targetBox = $("." + inputValue); 
        $(".topic-select").not(targetBox).hide(); 
        $(targetBox).show();
    }



    // Display success or warning messages based on whether voting was successful.
    var messageArray = messageList;
    var messageTag = '';
    messageArray.forEach(message => {
        var messageForId = localStorage.getItem('lastVotedFor');
        var tag = message[0];
        messageTag = tag;
        var content = message[1];
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${tag}`;
        messageDiv.innerHTML = `${content}`;
        var questionElement = document.getElementById(`question-${messageForId}`)
        // var cardElement = document.getElementById(`card-q-${messageForId}`)
        // cardElement.insertBefore(messageDiv, cardElement.childNodes[0]);
        questionElement.appendChild(messageDiv);
        if (tag === 'success') {
            $(`#question-${messageForId}`).prop('disabled',true);
            localStorage.setItem(`#question-${messageForId}-disabled`, true);
        }
    })

    // Store the states of collapsible elements in browser's local storage.
    // Allow browser to restore collapse state after refreshing or reloading.
    var questionIdArray = questionIdArrayFromTemplate;
    questionIdArray.forEach(storeCollapseState);

    function storeCollapseState(idText) {
        var questionId = parseInt(idText);

        // Allow browser to remember the disabled states of each question.
        var disabledState = localStorage.getItem(`#question-${questionId}-disabled`);
        $(`#question-${questionId}`).prop('disabled',disabledState);
        
        var resultChartData = [
            ['Choice', 'Vote'],
        ];


        // Display survey result for this question.
        if (disabledState) {
            const resultList = document.createElement('ul');
            resultList.setAttribute('id', `ul-result-${questionId}`);
            document.getElementById(`card-q-${questionId}`).append(resultList);
            getResult(questionId);
            document.getElementById(`q-choices-${questionId}`).display = 'block';

            // Load google charts
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);
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
            })
        }

        // Display survey results under question text
        function addResult(data) {
            const resultItem = document.createElement('li');
            resultItem.className = `li-result-${questionId}`;
            resultItem.innerHTML = `${data.fields.choice_text}`;
            var dataPair = [];
            dataPair.push((((`${data.fields.votes}`)/totalVote * 100).toFixed(0) + '%' + "\t" ) + `${data.fields.choice_text}`);
            dataPair.push(parseInt(`${data.fields.votes}`));
            resultChartData.push(dataPair);
            document.getElementById(`ul-result-${questionId}`).append(resultItem);
        }


        // Draw the chart and set the chart values
        function drawChart() {
            var width = (document.getElementById(`question-${questionId}`).offsetWidth) * 0.6;
            var data = google.visualization.arrayToDataTable(
                resultChartData
            );
            var options = {
            chartArea:{left: 5, width:'100%', height:'75%'},
            width: width,
            colors: ['#d9e6ef'],
            bar: {
                groupWidth: '75%'
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

            var chart = new google.visualization.BarChart(document.getElementById(`card-q-${questionId}`));

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

