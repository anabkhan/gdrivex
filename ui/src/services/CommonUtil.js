export const copyToClipboard = (text) => {
    console.log('Copying text', text)

    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("text/plain", text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

export const shareDownloadLink = (url, title) => {
    const shareData = {
        title,
        text: `Download ${title}`,
        url
      }
    
      try {
          console.log('sharing ', shareData)
        navigator.share(shareData)
        console.log('Shared successfully')
        // resultPara.textContent = 'MDN shared successfully'
      } catch(err) {
        // resultPara.textContent = 'Error: ' + err
        console.error('error while sharing', err)
      }
}