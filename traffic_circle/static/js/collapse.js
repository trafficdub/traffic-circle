document.addEventListener('DOMContentLoaded', () => {
    var questionIdArray = questionIdArrayFromTemplate;
    questionIdArray.forEach(storeCollapseState);
    function storeCollapseState(idText) {
        var questionId = parseInt(idText);
        $(`.multi-collapse-${questionId}`).on('shown.bs.collapse', function ()
        {
            var active = $(this).attr('id');
            var panels= localStorage.panels === undefined ? new Array() : JSON.parse(localStorage.panels);
            console.log(localStorage);
            if ($.inArray(active,panels)==-1) //check that the element is not in the array
                panels.push(active);
            localStorage.panels=JSON.stringify(panels);
        });
        
        $(`.multi-collapse-${questionId}`).on('hidden.bs.collapse', function ()
        {
            var active = $(this).attr('id');
            var panels= localStorage.panels === undefined ? new Array() : JSON.parse(localStorage.panels);
            var elementIndex=$.inArray(active,panels);
            console.log(localStorage);
            if (elementIndex!==-1) //check the array
            {        
                panels.splice(elementIndex,1); //remove item from array
            }
            localStorage.panels=JSON.stringify(panels); //save array on localStorage
        });
        
        var panels=localStorage.panels === undefined ? new Array() : JSON.parse(localStorage.panels); //get all panels
            for (var i in panels){ //<-- panel is the name of the cookie
                if ($("#"+panels[i]).hasClass('collapse')) // check if this is a panel
                {
                    $("#"+panels[i]).collapse("show");
                }
            }
    }
});

