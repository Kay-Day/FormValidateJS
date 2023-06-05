// Đối tượng 'main'
function main(options){
    function getParent(element,selector){
      while(element.parentElement){
        if(element.parentElement.matches(selector)){
            return element.parentElement;
        }
        element = element.parentElement;
      }
    }
    // Hàm thực hiện validat
    var selectorRules = {};
    function validate(inputElement, rule){
        // var errorElement = getParent(inputElement, '.form-group')
        var errorMessage;
        var errorElement =getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for(var i =0; i< rules.length; ++i){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                    default:
                        errorMessage = rules[i](inputElement.value);
            }
            
            if(errorMessage) break;

        }

            
        if(errorMessage){
            
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
           
        }else{
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorMessage;

    }
    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
  
    if(formElement){
        formElement.onsubmit = function(e){
            e.preventDefault();

            var isFormValaid = true;
            // Lặp qua từng rule và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                var isvalid = validate(inputElement, rule);
                if(!isvalid){
                    isFormValaid = false;
                }
            });
          
            console.log(formValues);
            if(isFormValaid){
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                       switch(input.type){
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                            case 'checkbox':
                                if(!input.matches(':checked')) 
                                values[input.name] = '';
                                return values;
                           if(!Array.isArray(values[input.name])){
                            values[input.name] = [];
                            
                           }
                           values[input.name].push(input.value);
                           break;
                           case 'file':
                             values[input.name] = input.files;
                           break;
                            default:
                            values[input.name] = input.value;


                       }
                        return values;
        
                    },{});
                    
                    options.onSubmit(formValues);
                }
                // Truong hop submit voi hanh vi mac dinh
                else{
                    formElement.submit();
                }
                
            }
        }
        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
       options.rules.forEach(function(rule){
        // Lưu lại các rules cho mỗi input
       if(Array.isArray(selectorRules[rule.selector])){
        selectorRules[rule.selector].push(rule.test);

       }else{
         selectorRules[rule.selector] = [rule.test];
       }
    //    selectorRules[rule.selector] = rule.test;
        var inputElements = formElement.querySelectorAll(rule.selector);
        Array.from(inputElements).forEach(function(inputElement){
            if(inputElement){
                // Xử lý trường hợp blur khỏi input
               inputElement.onblur = function(){
             
                validate(inputElement, rule);
               }
               // Xử lý mỗi khi người dùng nhập vào input
               inputElement.oninput = function(){
                var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                errorElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                 
               }
            }
    

        });

       });
       console.log(selectorRules);
    }


}
// Nguyên tắc của các rules :
// 1. Khi có lỗi => trả ra message lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả (undefined)
// Định nghĩa các rules
main.isRequired = function (selector, message){
    return {
        selector: selector,
        test : function(value){
            return value ? undefined : message || 'Vui lòng nhập trường hợp này';

        }
    };

}
main.isEmail = function(selector, message){
    return {
        selector: selector,
        test : function(value){
           var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
           return regex.test(value) ? undefined : 'Trường hợp này phải là email';
        }
    };

}

main.minLenghth = function(selector, min, message){
    return {
        selector: selector,
        test : function(value){
           return value.length >=min ? undefined : message || `Vui lòng nhập tối thiểu  ký tự ${min} kí tự`;
        }
    };

}

main.isConfirmed = function(selector, getConfirmValue, message){
    return {
        selector: selector,
        test: function(value){
           return value === getConfirmValue() ? undefined : message ||'Giá trị nhập vào không chính xác';
        }
    }
}

