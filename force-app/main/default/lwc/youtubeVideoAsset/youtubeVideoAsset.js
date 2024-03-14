/*************************************************************************************************
Author - Gunjan Kubde
Date - 4 Jan 2023
Description - Generic LWC Component to show YouTube videos using video Id.
**************************************************************************************************/
import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import iframe_api from '@salesforce/resourceUrl/iframe_api';
import widjet_api from '@salesforce/resourceUrl/widjet_api';

export default class youtubeVideoAsset extends LightningElement {
    @api youTubeId;
    player;

    onchange(event){
        this.youTubeId = event.detail.value; 
        console.log('youTubeId ' + this.youTubeId);
    }

    renderedCallback() {
        if (!this.youTubeId) {
            return;
        }

        if (window.YT) {
            if (this.player) {
                this.player.cueVideoById(this.youTubeId);
            } else {
                this.onYouTubeIframeAPIReady();
            }
        } else {
            Promise.all([
                loadScript(this, iframe_api),
                loadScript(this, widjet_api)
            ])
                .then(() => {
                    console.log('Script Loaded');
                    this.onYouTubeIframeAPIReady();
                })
                .catch(error => {
                    this.showErrorToast(error);
                });
        }
    }

    onPlayerError(e) {
        let explanation = '';
        if (e.data === 2) {
            explanation = 'Invalid YouTube ID';
        } else if (e.data === 5) {
            explanation =
                'The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.';
        } else if (e.data === 100) {
            explanation =
                'The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.';
        } else if (e.data === 101 || e.data === 150) {
            explanation =
                'The owner of the requested video does not allow it to be played in embedded players.';
        }

        this.showErrorToast(explanation);
    }

    showErrorToast(explanation) {
        const evt = new ShowToastEvent({
            title: 'Error loading YouTube player',
            message: explanation,
            variant: 'error'
        });
        this.dispatchEvent(evt);
    }

    onYouTubeIframeAPIReady() {
        try{
            const containerElem = this.template.querySelector('.comp');
            const playerElem = document.createElement('DIV');
            playerElem.className = 'player';
            containerElem.appendChild(playerElem);
    
            this.player = new window.YT.Player(playerElem, {
                height: '390',
                width: '100%',
                videoId: this.youTubeId,
                events: {
                    onError: this.onPlayerError.bind(this)
                }
            });
        }catch(error){
            this.showError(error);
        }
    }

    showError(error) {
        console.log('Error ' + error);
        console.log('Error ' + JSON.stringify(error));
    }
}