
export function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        const textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}



export function getPrefixLink() {
    const firstSlash = location.href.indexOf('/', 9);
    const lastSlash = location.href.lastIndexOf('/');

    let prefixLink = location.href.substr(firstSlash, lastSlash-firstSlash);
    if(prefixLink.lastIndexOf('/') == prefixLink.length - '/admin_panel'.length) {
        prefixLink = prefixLink.substr(0, prefixLink.length-'/admin_panel'.length)
    }

    return prefixLink;
}



export function parseQueryString(qs) {
    qs = qs.split('+').join(' ');

    let params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = (decodeURIComponent(tokens[2]) == "null") ? null : decodeURIComponent(tokens[2]);
    }

    return params;
}