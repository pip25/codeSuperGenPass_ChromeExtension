function genPass(s){sendPass||s?(sendPass=Pass.init(s),""==sendPass.password()&&sendPass.password($("#password").val()),pass=sendPass.generate($("#domain").val(),$("#disabletld").is(":checked"))):(console.log("generating without id"),pass=SGPLocal($("#password").val(),$("#domain").val(),$("#disabletld").is(":checked"),10,null)),console.log(sendPass),console.log(pass),$("#genpasswd").val(pass.pass),$("#generated").slideDown(250).delay(250),$("#hint").delay(250).fadeIn(400).delay(3e3).fadeOut(400),$("#regen").removeAttr("disabled"),chrome.tabs.getSelected(null,function(s){chrome.tabs.sendRequest(s.id,{type:"set",value:$("#genpasswd").val()},function(){})})}var passid=!1,sendPass=!1,passes=JSON.parse(localStorage.passwords||"[]");$(document).ready(function(){$("#popup_title").html(chrome.i18n.getMessage("popup_title")),$("#popup_disable_subdomain_removal").html(chrome.i18n.getMessage("popup_disable_subdomain_removal")),$("#dscr").html(chrome.i18n.getMessage("popup_master_password")),$("#popup_your_generated_password").html(chrome.i18n.getMessage("popup_your_generated_password")),$("#popup_domain_name").html(chrome.i18n.getMessage("popup_domain_name")),$("#regen").html(chrome.i18n.getMessage("popup_generate")),$("#popup_list_title").html(chrome.i18n.getMessage("popup_list_title")),chrome.tabs.getSelected(null,function(s){$("#domain").val(gp2_process_uri(s.url,!1)),$("#domainh").val(s.url),0==passes.length?($("#master_input").show(),$("#regen").removeClass("forbit"),$("#scp_list_title").hide(),$("#scp_list").hide(),passid=null):1==passes.length?(passid=passes[0],sendPass=Pass.init(passid),""==sendPass.password()?$("#master_input").slideDown(250):genPass(passes[0])):($("#master_input").hide(),$("#regen").addClass("forbit"),$("#scp_list_title").show(),$("#scp_list").show(),$.each(passes,function(s,e){$("#scp_list").append($("<li/>",{id:e,text:localStorage["password_"+e+"_name"]}).click(function(){passid=this.id,$("#genpasswd").val(""),$(this).siblings().removeClass("active"),$(this).addClass("active"),sendPass=Pass.init(passid),console.log(sendPass),sendPass.password()===!1||""==sendPass.password()?($("#master_input").slideDown(250),$("#password").focus().select()):($("#master_input").slideUp(250),genPass(passid))}))}))}),$("#disabletld").click(function(){$("#domain").trigger("blur")}),$("#domain,#password").focus(function(){$(this).addClass("focuson")}).blur(function(){$(this).removeClass("focuson")}),$("#domain").change(function(){}).blur(function(){$("#domain").val(gp2_process_uri($("#domain").val(),$("#disabletld").is(":checked"))),$("#password").focus()}),$("#password").keyup(function(s){this.value.length>0?$("#regen").removeAttr("disabled"):$("#regen").attr("disabled","disabled"),"hash"==sendPass.type&&(console.log("yay"),b64_md5($(this).val())==sendPass.generate().pass?$(this).addClass("good").removeClass("bad"):$(this).addClass("bad").removeClass("good")),13==s.keyCode&&$("#regen").click()}),$("#genpasswd").focus(function(){$(this).get(0).type="text"}).blur(function(){$(this).get(0).type="password"}),$("#regen").attr("disabled","disabled").click(function(){genPass(passid)}),$("body").keyup(function(s){if(40==s.keyCode)next=$("#scp_list li.over").next().length>0?$("#scp_list li.over").next():$("#scp_list li").first(),$("#scp_list li").removeClass("over").filter(next).addClass("over");else if(38==s.keyCode)prev=$("#scp_list li.over").prev().length>0?$("#scp_list li.over").prev():$("#scp_list li").last(),$("#scp_list li").removeClass("over").filter(prev).addClass("over");else if(13==s.keyCode)return $("#scp_list .over").click(),!1})});