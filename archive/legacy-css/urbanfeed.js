function checkField()
{
  if((f1.t1.value=="") )
  {
      alert("Fill the Name");
	  f1.t1.focus();
      return false;
  }
  else if(f1.t3.value=="")
  {
    alert("Fill the Contact No");
    f1.t3.focus();
     return false;

  }
 
  else if(f1.t5.value=="")
  {
    alert("Fill the Comment");
    f1.t5.focus();
     return false;

  }
  else return true;
}  

function check_alpha(num)
 {
  var ref = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.";
  temp = num.value;
  for(i=0;i<=temp.length;i++)
    {
     s = ref.indexOf(temp.charAt(i));
      if(s==-1)
        break;
    }
  if(s==-1) 
   {
    alert("Enter the alphabets");
    num.value="";
    num.focus(); 
   }
}

function check_num(num)
 {
  var ref = " +1234567890 ";
  temp = num.value;
  for(i=0;i<=temp.length;i++)
    {
     s = ref.indexOf(temp.charAt(i));
      if(s==-1)
        break;
    }
  if(s==-1) 
   {
    alert("Enter the Numbers");
    num.value="";
    num.focus(); 
   }
}

function echeck(str) {

		var at="@"
		var dot="."
		var lat=str.indexOf(at)
		var lstr=str.length
		var ldot=str.indexOf(dot)
		if (str.indexOf(at)==-1){
		   alert("Invalid E-mail ID")
		   return false
		}

		if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr){
		   alert("Invalid E-mail ID")
		   return false
		}

		if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==lstr){
		    alert("Invalid E-mail ID")
		    return false
		}

		 if (str.indexOf(at,(lat+1))!=-1){
		    alert("Invalid E-mail ID")
		    return false
		 }

		 if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot){
		    alert("Invalid E-mail ID")
		    return false
		 }

		 if (str.indexOf(dot,(lat+2))==-1){
		    alert("Invalid E-mail ID")
		    return false
		 }
		
		 if (str.indexOf(" ")!=-1){
		    alert("Invalid E-mail ID")
		    return false
		 }

 		 return true					
	}

function ValidateForm(){
	var emailID=document.f1.t2
	
	if ((emailID.value==null)||(emailID.value=="")){
		alert("Please Enter your Email ID")
		emailID.focus()
		return false
	}
	if (echeck(emailID.value)==false){
		emailID.value=""
		emailID.focus()
		return false
	}
	return true
 }
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                                          
                                                                              
                                                                              
                                                                              
                                                                              
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                
                                                                                     
                                                                                
                                                                                     
                                                                                
                                                                                     
                                                                                     
                                                                                          