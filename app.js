// Budget Controller
var budgetController = (function(){
/*
    var x = 32;
    var add = function(a){
        return x + a ;
    }         // testing things 
    return {
        publicTest : function(b){
            return (add(b));
        }
    }
*/
var Expense = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
};

Expense.prototype.calcPercentage = function(totalIncome){
    if (totalIncome > 0 ){
    this.percentage = Math.round((this.value/ totalIncome) * 100 );
    }
    else {
        this.percentage = -1;
    }
};
Expense.prototype.getPercentage = function(){
 return this.percentage;
};

var Income = function(id,description,value){
    this.id = id;
    this.description = description;
    this.value = value;
};
var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(curr){

        sum += curr.value;

    });
    data.totals[type] = sum;
};

var data = {
    allItems : {
        exp : [],
        inc : []
    },
    totals : {
        exp : 0,
        inc : 0
    },
    budget : 0,
    percentage : -1
};

return {
    addItem : function(type, des,val){
        var newItem,ID;
        // Create new Id
        if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        }
        else {
            ID = 0;
        }
        // Create new Item based on inc or exp type
        if (type === 'exp'){
      newItem =  new Expense(ID, des, val);
    }
    else if (type === 'inc'){
      newItem =  new Income(ID, des, val);

    }
    // push it into our data structure 
    data.allItems[type].push(newItem);

    // return new element
    return newItem;
},

deleteItem : function(type,id){
    var ids, index;

    ids = data.allItems[type].map(function(curr){

        return curr.id;
     });

     index = ids.indexOf(id);

if (index !== -1){
    data.allItems[type].splice(index, 1);
}


},

calcBudget : function(){

    //1 Calculate total income and total expenses
    calculateTotal('exp');
    calculateTotal('inc');


    //2 calculate the budget : inc - exp
    data.budget = data.totals.inc - data.totals.exp;

    //3 calculate the percentage of the income that we spent 
    if(data.totals.inc > 0){
    data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
    //exp = 100 and inc = 200, then we spend 50% = .5 * 100 
}
else {
    data.percentage = -1;
}},

calculatePercentages : function(){
data.allItems.exp.forEach(function(cur){
     cur.calcPercentage(data.totals.inc);
});

},
getPercentages : function(){
 var allPercentages = data.allItems.exp.map(function(cur){
     return cur.getPercentage();

 });
 return allPercentages;
},
getBudget : function(){
    return {
        budget: data.budget,
        totalInc : data.totals.inc,
        totalExp : data.totals.exp,
        percentage : data.percentage

    }
},

};




})();


// UI Controller
var UIController = (function(){

    var DOMstrings = {
        inputType : '.add__type',
        inputDes : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container_clearfix',
        expensesPercentageLabel : '.item__percentage',
        dateLabel : '.budget__title--month'

    };
   var formatNumber = function(num,type){
        var num, numSplit, int, dec ,type;
            // 1 + or - before the number 

            // 2. decimal points 

            // 3 use of , separating the thousands 

            // 2989.7654 => 2,989.76 example
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length > 3){
               int = int.substr(0,int.length - 3)+ ',' + int.substr(int.length - 3, 3); //input 2890 => 2,890
            }

            dec = numSplit[1];
            
            return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec;

        };
        var nodeListForEach =function(list, callback){

            for ( var i = 0; i < list.length; i++ ){
                callback(list[i], i);
            }
            };

    return {
        getInput : function(){ 
            return{
                type:document.querySelector(DOMstrings.inputType).value, // will be either income or expense
                des: document.querySelector(DOMstrings.inputDes).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },
        addListItems : function(obj,type){
            var html,newHtml, element;
            // 1 create html string with placeholder text
            if (type === 'inc'){
                element =  DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //2 replace placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));



            // insert the html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItems : function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);




        },
        clearFields :function() {
           var fields, fieldsArray;
           fields = document.querySelectorAll(DOMstrings.inputDes + ', ' + DOMstrings.inputValue);
          fieldsArray = Array.prototype.slice.call(fields);
          fieldsArray.forEach(function(current, index, array){
              current.value = "";

          });
          fieldsArray[0].focus();
        },
        displayBudget : function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
             document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            }
            else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '--';

            }


        },
        displayPercentages : function(percentages){

        var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
           

        nodeListForEach(fields, function(current,index){
            if (percentages[index] > 0){
           current.textContent = percentages[index] + '%'; 
            } 
            else {
                current.textContent = '--';
            }
        });
        },
        displayMonth : function(){
            var now, year,month,months;
            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;


        },
        changedType : function(){

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDes + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){

                cur.classList.toggle('red-focus');

            });
        },
        
        getDOMstrings : function(){
            return DOMstrings;
        }
    };


})();


// Global App Controller
var controller = (function(budgetCtrl, UICtrl){
/*
    var z = budgetCtrl.publicTest(5); // just testing
    return{
        anotherPublic : function(){
            console.log(z);
        }
    }
    */
    var setupEventListener = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // console.log('button was clicked');
        document.addEventListener('keypress', function(event){
        // console.log(event);
        if(event.keyCode === 13 || event.which === 13){
            // console.log('enter was pressed'); testing
            ctrlAddItem();
        }

    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    
    var updateBudget = function(){
    // 1. Calculate the budget
        budgetCtrl.calcBudget();

    //2 return the budget 
        var budget = budgetCtrl.getBudget();


    //3. Display the budget on UI
    // console.log(budget);
    // console.log('it works');
    UICtrl.displayBudget(budget);

     };

    var updatePercentages = function(){
        var percentages ;
        //1 calculate the percentages 
        budgetCtrl.calculatePercentages();
        //2. Read percentages from budget controller
      percentages =  budgetCtrl.getPercentages();
        // console.log(percentages);
        //3. Update the UI with new percentages 

        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function(){
        var input, newItems;
         // 1. get the field input data
         input = UICtrl.getInput();
        //  console.log(input);

        if (input.des !== "" && !isNaN(input.value) && input.value > 0){
    //2. add the item to the budget controller
       newItems = budgetCtrl.addItem(input.type, input.des, input.value);
        
    //3 . add the new item to the UI
        UICtrl.addListItems(newItems, input.type);

        // 3.1  clear fields 
        UICtrl.clearFields();

        // 4. calculate and update budget
        updateBudget();

        // 5. calculate and update percentages 

            updatePercentages();

        //
        }
    };
   
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        // console.log(event.target);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // console.log(itemID);
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure 
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from UI

            UICtrl.deleteListItems(itemID);

            //3. update and show new budget
            updateBudget();

            //4. calculate and update percentages 

            updatePercentages();
            
            

        }
    };
   return {
       init : function(){
           console.log('application has started');
        UICtrl.displayMonth();   
        UICtrl.displayBudget({
        budget: 0,
        totalInc : 0,
        totalExp : 0,
        percentage : -1

        });

           setupEventListener();
       }
   }; 
    
})(budgetController,UIController);

controller.init();




















































