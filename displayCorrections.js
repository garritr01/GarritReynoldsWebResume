const mainURL = "http://127.0.0.1:5500/images/";

function postMainWidth(frames, log = 0) {
    const width = document.body.scrollWidth;
    frames.forEach(frameID => {
        log > 0 && console.log(`Main width: ${width}px posted to ${frameID}`);
        const frame = document.getElementById(frameID + 'Frame');
        frame.contentWindow.postMessage({ type: 'mainWidth', width }, '*');
    });
}

function adjustFrameWidth(elementID, log = 0) {
    window.addEventListener('message', function (msg) {
        if (msg.data.type === 'mainWidth') {
            log > 0 && console.log(`Received mainWidth message in ${elementID}: ${msg.data.width}px`);
            const body = document.getElementById(elementID);
            body.style.width = (msg.data.width * 0.9) + 'px'; // Adjust width

            // Post body height after width adjustment, including elementID
            const newHeight = document.body.scrollHeight;
            window.parent.postMessage({ type: 'mainHeight', height: newHeight, elementID: elementID }, '*');
            log > 0 && console.log(`${elementID} height posted: ${newHeight}px`);
        }
    });
}

function adjustIframeHeight(frames, log = 0) {
    window.addEventListener('message', function (msg) {
        if (msg.data.type === 'mainHeight') {
            log > 0 && console.log(`Received mainHeight message for ${msg.data.elementID}: ${msg.data.height}px`);

            // Iterate over frames to find the matching iframe
            frames.forEach(frameID => {
                if (frameID + 'Frame' === msg.data.elementID + 'Frame') {
                    const iframe = document.getElementById(frameID + 'Frame');
                    iframe.style.height = msg.data.height + 'px'; // Adjust iframe height
                    log > 0 && console.log(`${frameID} iframe height set to ${msg.data.height}px`);
                }
            });
        }
    });
}

function expansionCorrection(log = 0) {
    document.querySelectorAll('.acronym').forEach(acronym =>{
        acronym.addEventListener('mouseenter', function (){
            log > 0 && console.log('-- -- -- expansion -- -- --');
            const expandBox = this.querySelector('.expand');
            
            expandBox.style.display = '-webkit-box';
            expandBox.style.left = `${-50 * (expandBox.offsetWidth / this.offsetWidth - 1)}%`;

            const expandRect = expandBox.getBoundingClientRect();
            const acroRect = this.getBoundingClientRect();
            
            const width = document.body.scrollWidth;
            const bodyStyle = window.getComputedStyle(document.body);
            const paddingLeft = parseInt(bodyStyle.marginLeft, 10);
            const expandStyle = window.getComputedStyle(expandBox);
            const xPadding = parseInt(expandStyle.paddingLeft) + parseInt(expandStyle.paddingRight);

            let i = 1;
            while ((expandRect.width+xPadding) > i*width) {
                i++;
            }
            if (i > 1) {
                expandBox.style.top = `-${i*100}%`;
                expandBox.style.whiteSpace = 'normal';
                expandBox.style.width = `${width}px`;
                expandBox.style.webkitLineClamp = `${i}`;
                expandBox.style.left = `${-100 * (acroRect.left - paddingLeft) / acroRect.width}%`;
                expandBox.style.right = 'auto';
            } else {
                if (expandRect.top <= 0) {
                    expandBox.style.top = '100%';
                    log > 0 && console.log(`Expansion placed below ${acroRect.top}px`);
                } else if (log > 0) {
                    console.log(`Expansion placed above ${acroRect.top}px`);
                }

                if (expandRect.right > width) {
                    expandBox.style.right = `${100*(acroRect.right - width) / acroRect.width}%`;
                    expandBox.style.left = 'auto';
                    log > 0 && console.log(`Expansion pinned to right @ ${width}px`);
                } else if (expandRect.left < 0) {
                    expandBox.style.left = `${-100*(acroRect.left - paddingLeft) / acroRect.width}%`;
                    expandBox.style.right = 'auto';
                    log > 0 && console.log(`Expansion pinned to left @ 0px`);
                } else if (log > 0) {
                    console.log(`Expansion centered at ${(acroRect.left + acroRect.right)/2}`);
                }
            }

            if (log > 1) {
                console.log(`screen width: ${width}`);
                console.log(`acronymEdge: ${acroRect.right}`);
                console.log(`paddingLeft: ${paddingLeft}`);
                console.log('acronym',acroRect);
                console.log('initial expansion', expandRect);
                console.log('updated expansion',expandBox.getBoundingClientRect());
            }
        });

        acronym.addEventListener('mouseleave', function () {
            const expandBox = this.querySelector('.expand');

            // Reset styles back to initial values
            expandBox.style.display = 'none';
            expandBox.style.position = 'absolute';
            expandBox.style.top = '-100%';
            expandBox.style.backgroundColor = '#d7e5ee';
            expandBox.style.border = '1px solid #4c4c6f';
            expandBox.style.whiteSpace = 'nowrap';

            // Explicitly clear left and right to avoid lingering values
            expandBox.style.left = '';
            expandBox.style.right = '';
            expandBox.style.width = '';
            expandBox.style.webkitLineClamp = '';
        });
    });
}

function adjustDropdownLinkWidths(log = 0) {
    const links = document.querySelectorAll('.dropdownLink');
    links.forEach(link => {
        log > 0 && console.log(link.style);
        if (link.style.display === 'block') {
            link.style.display = 'inline-block';
            const width = link.scrollWidth;
            link.style.display = 'block';
            link.style.width = `${width}px`;
            log > 0 && console.log(`${link.textContent} resized to ${width} wide`)
        } else {
            log > 0 && console.log(`${link.textContent} not currently displayed`)
        }
    });
}

function dropdown(elementID, log = 0) {
    // select all dropdownLinks and add a click listener
    document.querySelectorAll('.dropdownLink').forEach(dLink => {
        dLink.addEventListener('click', function (event) {
            
            log > 0 && console.log('-- -- -- dropdown link -- -- --');
            
            // get tag and use to choose dropdown content
            const name = this.getAttribute("tag");
            const ddBox = document.querySelector(`.dropdown[tag="${name}"]`);

            //route to images directory + specified image
            const bkgIn = ddBox.getAttribute("bkg") || null;
            const bkg = mainURL + bkgIn; 

            //check for background image object
            let bkgImg = ddBox.querySelector('.bkgImg') || null;

            //create background image object if specified and not existing
            if (!bkgIn) {
                log > 0 && console.log(`No background image request.`);
            } else if (bkgImg) {
                log > 0 && console.log(`${bkgIn} class found`);
            } else {
                const bkgImg = document.createElement('div');
                bkgImg.className = 'bkgImg';
                bkgImg.style.backgroundImage = `url('${bkg}')`;
                bkgImg.style.width = '100%';
                bkgImg.style.height = '100%';
                bkgImg.style.left = '0';
                bkgImg.style.zIndex = bkgImg.style.zIndex - 1;
                ddBox.prepend(bkgImg);
                log > 0 && console.log(`${bkgIn} class not found, was created`);
            }

            log > 0 && console.log(`tag: ${name}`);
            
            // if rendered remove, else add
            if (ddBox.style.display === "block") {
                ddBox.style.display = 'none';
                this.classList.remove('active');
                log > 1 && console.log("removing visibility of: ",name);
            } else {
                ddBox.style.display = 'block';
                this.classList.add('active');
                log > 1 && console.log(`displaying: ${name} with background image from ${bkg}`);
            }

            // indicate main body size change
            window.parent.postMessage({ type: 'mainHeight', height: document.body.scrollHeight, elementID: elementID }, '*');
        });
    });
}
