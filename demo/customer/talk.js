window.addEventListener('message',(e) => {
  console.log("message e:",e)
  if (e.data['target'] === 'customer') {
    if (e.data['token']) {
      window.localStorage.setItem('talkToken', e.data['token'])
    }
  }
})

function talkButtonClicked() {
  const iframe = document.getElementById('talk');
  if(iframe.style.display==="none"){
    iframe.style.display="block";
    iframe.src = iframe.src
  }else{
    iframe.style.display="none";
  }
}

// eslint-disable-next-line no-unused-vars
function load() {
  let ciframe = document.createElement("iframe");
  ciframe.id='talk';
  // eslint-disable-next-line no-undef
  ciframe.src= talk_customer_url;
  ciframe.className='float-talk';
  document.body.appendChild(ciframe);
  ciframe = null;

  const btn = document.createElement("input");
  btn.type = "button";
  btn.value = "客服";
  btn.id="btn";
  btn.className="float-button";
  btn.addEventListener('click', talkButtonClicked);
  document.body.appendChild(btn);

  const iframe = document.getElementById('talk');
  const sendTalkToken = () => {
    iframe.contentWindow.postMessage({
      target: 'customer',
      token: window.localStorage.getItem('talkToken')
    }, '*')
  }

  iframe.contentWindow.postMessage({
    target: 'customer',
    token: window.localStorage.getItem('talkToken')
  }, '*')

  if (iframe.attachEvent) { // IE
    iframe.onreadystatechange = () => {
      if (iframe.readystate == 'complete') {
        sendTalkToken()
      }
    }
  }
  iframe.onload = () => {
    sendTalkToken()
  }

}
