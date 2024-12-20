// ==UserScript==
// @name         Bulk Upload Steam Achievement Images
// @namespace    https://starcove.studio/
// @version      2024-12-06
// @description  Attempts to bulk upload steam achievement images
// @author       StarCove Studio
// @match        https://partner.steamgames.com/apps/achievements/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steamgames.com
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/*
run 
`python3 -m http.server 8080`
In the directory with all the achievement icons
*/

const ICON_TYPE_ACHIEVED = 'achieved';
const ICON_TYPE_UNACHIEVED = 'unachieved';

const ACHIEVED_ICON_PREFIX = '';
const UNACHIEVED_ICON_PREFIX = 'LOCKED_';

const FILE_SERVER_PORT = 8080;

const waitForElm = (selector) => {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        // timeout here?

        // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
};

const tryUploadIcon = async (achId, rowId, iconType = ICON_TYPE_ACHIEVED) => {
    // which TD in the TR has the correct file input for achieved/unachieved
    const tdIndex = iconType === ICON_TYPE_ACHIEVED ? 5 : 6;
    const fileName = iconType === ICON_TYPE_ACHIEVED ? `${ACHIEVED_ICON_PREFIX}${achId}.PNG` : `${UNACHIEVED_ICON_PREFIX}${achId}.PNG`;

    const iconUploadForm = await waitForElm(`#${rowId} > td:nth-child(${tdIndex}) > form`);
    const iconFileInput = iconUploadForm.querySelector('input[type=file]');
    const existingIcon = iconUploadForm.querySelector('img');
    if (existingIcon.getAttribute('src').indexOf('0000000000000000000000000000000000000000.jpg') === -1) {
        console.log('Icon exists already, skipping');
        return;
    }

    try {
        const result = await GM.xmlHttpRequest({
            method: 'GET',
            url: `http://localhost:${FILE_SERVER_PORT}/${iconType}/${fileName}`,
            responseType: 'blob',
        });

        const file = new File([result.response], fileName, { type: result.response.type });
        const container = new DataTransfer();
        container.items.add(file);
        iconFileInput.files = container.files;
        const uploadButton = iconUploadForm.querySelector('input[value="Upload"]');
        uploadButton.click();
        const outputSuccess = await waitForElm('#achievement_upload_response.outputSuccess');
        outputSuccess.classList.remove('outputSuccess');
        outputSuccess.innerHTML = '';
    } catch (e) {
        console.error(`Could not upload achievement ${achId}:`);
        console.error(e);
    }
};

const startBulkUpload = async () => {
    console.log('Starting bulk upload!');
    const achievementTableTbody = document.querySelector('#achievementTable > tbody');
    const trs = achievementTableTbody.getElementsByTagName('tr');
    for (let index = 0; index < trs.length; index++) {
        console.log('Running achievement index:', index);
        const tr = trs[index];
        const achId = tr.querySelector('td:first-child').innerText.split('\n')[0];
        console.log(achId);
        const editButton = tr.querySelector('input[type="submit"][value="Edit"]');
        editButton.click();

        await tryUploadIcon(achId, tr.id, ICON_TYPE_ACHIEVED);
        await tryUploadIcon(achId, tr.id, ICON_TYPE_UNACHIEVED);

        const saveButton = tr.querySelector('input[value="Save"]');
        saveButton.click();

        await waitForElm(`#${tr.id} input[value="Edit"]`);
    }
};

const addButtonToPage = () => {
    const achTableTHeadRow = document.querySelector('#achievementTable > thead > tr');
    const newAchTD = achTableTHeadRow.querySelector('td:first-child');
    newAchTD.setAttribute('colspan', 1);
    const bulkUploadTD = document.createElement('td');
    bulkUploadTD.innerHTML = `<input class="btn_darkblue_white_innerfade btn_medium" type="submit" value="Bulk Upload" onclick="document.dispatchEvent(new CustomEvent('start-bulk-upload'));">`;
    achTableTHeadRow.appendChild(bulkUploadTD);
};

(async () => {
    'use strict';
    const achievementTableTbody = await waitForElm('#achievementTable > tbody');
    document.addEventListener('start-bulk-upload', startBulkUpload);
    addButtonToPage();
})();
