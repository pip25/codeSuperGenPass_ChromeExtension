var passid = false,
  sendPass = false,
  passes = JSON.parse(localStorage['passwords'] || '[]');

function selectText(element) {
  var text = document.getElementById(element);
  if (document.body.createTextRange) {
    var range = document.body.createTextRange();
    range.moveToElementText(text);
    range.select();
  } else if (window.getSelection) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    /*if(selection.setBaseAndExtent){
        selection.setBaseAndExtent(text, 0, text, 1);
    }*/
  } else {
    //alert("none");
  }
}

function genPass(passid) {
  $('#hint,#hint2,#genpasswd_text').stop().hide();
  if (!sendPass && !passid) {
    //console.log('generating without id');
    pass = SGPLocal(
      $('#password').val(),
      $('#domain').val(),
      $('#disabletld').is(':checked'),
      10,
      null
    );
  } else {
    sendPass = Pass.init(passid);
    if (sendPass.password() == '') {
      sendPass.password($('#password').val());
    }
    pass = sendPass.generate($('#domain').val(), $('#disabletld').is(':checked'));
  }
  //console.log(sendPass);
  //console.log(pass);
  $('#genpasswd').val(pass.pass);
  var hilightedHtml = pass.pass.replace(/([+\-]?[0-9]+(\.[0-9]+)?)/g, "<i>$1</i>");

  $('#genpasswd_text').html(hilightedHtml);
  $('#generated').slideDown(250).delay(250);

  $('#hint').delay(250).fadeIn(400).delay(3000).fadeOut(400);

  $('#regen').removeAttr('disabled');
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {
      type: 'set',
      value: $('#genpasswd').val()
    }, function() {});
  });
}

$(document).ready(function() {


  $("#popup_title").html(chrome.i18n.getMessage("popup_title"));
  $("#popup_disable_subdomain_removal").html(chrome.i18n.getMessage("popup_disable_subdomain_removal"));
  $("#dscr").html(chrome.i18n.getMessage("popup_master_password"));
  $("#popup_your_generated_password").html(chrome.i18n.getMessage("popup_your_generated_password"));
  $("#popup_domain_name").html(chrome.i18n.getMessage("popup_domain_name"));
  $("#regen").html(chrome.i18n.getMessage("popup_generate"));
  $("#popup_list_title").html(chrome.i18n.getMessage("popup_list_title"));
  if (passes.length == 1){
    $("#hint").html(chrome.i18n.getMessage("popup_gen_hint_default") + "<div></div>");
  }else{
    $("#hint").html(chrome.i18n.getMessage("popup_gen_hint") + "<div></div>");
  }
  $("#hint2").html(chrome.i18n.getMessage("popup_gen_hint2") + "<div></div>");



  //Get the URL from the selected tab
  chrome.tabs.getSelected(null, function(tab) {

    $('#domain').val(gp2_process_uri(tab.url, false));
    $('#domainh').val(tab.url);
    if (passes.length == 0) {
      $('#master_input').show();
      $('#regen').removeClass('forbit');

      $('#scp_list_title').hide();
      $('#scp_list').hide();
      passid = null;
    } else if (passes.length == 1) {
      $('#scp_list_title').hide();
      $('#scp_list').hide();
      passid = passes[0];
      sendPass = Pass.init(passid);
      if (sendPass.password() == '') {
        $('#master_input').slideDown(250);
      } else {
        genPass(passes[0]);
      }
    } else {
      $('#master_input').hide();
      $('#regen').addClass('forbit');
      $('#scp_list_title').show();
      $('#scp_list').show();
      $.each(passes, function(i, id) {
        $('#scp_list').append(
          $('<li/>', {
            id: id,
            text: localStorage['password_' + id + '_name']
          }).click(function() {
            passid = this.id;
            $('#genpasswd').val('');
            $(this).siblings().removeClass('active');
            $(this).addClass('active');
            sendPass = Pass.init(passid);
            //We need a password input box!
            if (sendPass.password() === false || sendPass.password() == '') {
              $('#master_input').slideDown(250);
              $('#password').focus().select();
            } else {
              $('#master_input').slideUp(250);
              genPass(passid);
            }
          })
        );
      });
    }

    $("#password").focus();
  });

  $('#disabletld').click(function() {
    $('#domain').trigger('blur');
  });
  $('#domain,#password').focus(function() {
    $(this).addClass('focuson');
  }).blur(function() {
    $(this).removeClass('focuson');
  });
  $('#domain').change(function() {
    //https://github.com/CheneyLin/codeSuperGenPass_ChromeExtension/issues/1
    //  if ($('#domainh').val().indexOf($('#domain').val()) < 0) {
    //    $('#domainh').val($('#domain').val());
    //  }
    //console.log($('#domainh').val())
  }).blur(function() {
    //    $('#domain').val(gp2_process_uri($('#domainh').val(), $('#disabletld').is(':checked')));
    $('#domain').val(gp2_process_uri($('#domain').val(), $('#disabletld').is(':checked')));
    $('#password').focus();
  });

  $('#password').keyup(function(e) {
    this.value.length > 0 ?
      $('#regen').removeAttr('disabled') :
      $('#regen').attr('disabled', 'disabled');

    if (sendPass.type == 'hash') {
      console.log('yay');
      if (b64_md5($(this).val()) == sendPass.generate().pass) {
        $(this).addClass('good').removeClass('bad');
      } else {
        $(this).addClass('bad').removeClass('good');
      }
    }

    if (e.keyCode == 13) {
      $('#regen').click();
    }
  });

  $('#genpasswd').click(function() {
    console.log('click');
    //$(this).get(0).type = 'text';
    $('#genpasswd_text').fadeIn(250).delay(5000).fadeOut(400);
    selectText('genpasswd_text');
    document.execCommand("Copy");
    $('#hint').hide();
    $('#hint2').fadeIn(400).delay(3000).fadeOut(400);
  });

  $('#regen').attr('disabled', 'disabled').click(function() {
    genPass(passid);
  });

  $('body').keyup(function(e) {
    if (e.keyCode == 40) {
      next = $('#scp_list li.over').next().length > 0 ?
        $('#scp_list li.over').next() : $('#scp_list li').first();
      $('#scp_list li').removeClass('over').filter(next).addClass('over');
    } else if (e.keyCode == 38) {
      prev = $('#scp_list li.over').prev().length > 0 ?
        $('#scp_list li.over').prev() : $('#scp_list li').last();
      $('#scp_list li').removeClass('over').filter(prev).addClass('over');
    } else if (e.keyCode == 13) {
      $('#scp_list .over').click();
      return false;
    }
  });

});
