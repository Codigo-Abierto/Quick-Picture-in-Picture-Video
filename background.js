/*
 * This file is part of Publiacidez Extension Project,
 *
 * Publiacidez Extension is free software; you can redistribute it and/or modify it under the terms of the 
 * GNU General Public License version 3 as published by the Free Software Foundation.
 *
 * Publiacidez extension is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied 
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Publiacidez.  If not, see <http://www.gnu.org/licenses/>.
 */

//Quick Picture-in-Picture Video

//
chrome.browserAction.setTitle({title: chrome.i18n.getMessage("Tooltip")});
if (!localStorage.getItem("pip-number")) localStorage.setItem("pip-number", "0");

//browser action (PiP video)
if (document.pictureInPictureEnabled) {    
    chrome.browserAction.onClicked.addListener(tab => {
        if ((tab.url)&&(tab.url.indexOf("http") >= 0)) {
            const pip_n = localStorage.getItem("pip-number");
            chrome.tabs.executeScript(tab.id,  {
                code: `
                var pip_number = ${pip_n};
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                } else {        
                    let videos = document.getElementsByTagName('video');
                    if (videos.length > 0) { 
                        for (let i=videos.length-1; i >= 0; i--) {
                            if (!videos[i].paused) {                
                                if (videos[i]) {
                                    videos[i].onleavepictureinpicture = e => { 
                                        videos[i].pause();                            
                                    };
                                    videos[i].setAttribute("pip-number", pip_number+1);                                       
                                    videos[i].requestPictureInPicture();  
                                    chrome.runtime.sendMessage({cmd: "inc-pip-number"});
                                    break;
                                }                                                     
                            }
                        }      
                    }
                }                 
                `
                , allFrames: true
            });
        }        
    });    
} else {
    console.log(chrome.i18n.getMessage("Error_Soporte"));
}

//Comandos adicionales:  
chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        //Duplicar tab (para poder seguir navegando en el tab del que se hace PiP)
        case 'open-duplicate-tab':        
            chrome.tabs.query( {currentWindow: true, active: true}, function(tabs) {
                var tab = tabs[0];
                chrome.tabs.duplicate(tab.id);
            });        
            break;
        //Alternar Pause/Play del último video de que se ha hecho PiP
        case 'toggle-play':                 
            chrome.tabs.query({}, function(tabs) { 
                for (i=0; i < tabs.length; i++) {
                    if ((tabs[i].url)&&(tabs[i].url.indexOf("http") >= 0)) {
                        const pip_n = localStorage.getItem("pip-number");
                        chrome.tabs.executeScript(tabs[i].id,  {
                            code: `
                            var pip_video = document.querySelector('video[pip-number="${pip_n}"]');                            
                            if (pip_video) {    
                                if (pip_video.paused) {
                                    pip_video.play();            
                                } else { 
                                    pip_video.pause();                        
                                }
                            }
                            `, 
                            allFrames: true
                        });
                    }                        
                }                                                
            });               
            break;          
      }  
});

//
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {  
    switch (message.cmd) {
        case 'inc-pip-number':
            localStorage.setItem("pip-number", JSON.stringify(JSON.parse(localStorage.getItem("pip-number"))+1));
            break;
    }
});






