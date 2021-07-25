import { InsertDriveFile } from '@material-ui/icons';
import React from 'react'
import '../../styles/FileItem.css'

// const monthNames = 

const FileItem = ({id, caption, timestamp, fileUrl, size}) => {

    // const fileDate = 

    const getReadableFileSizeString = (fileSizeInBytes) => {
        let i = -1;
        const byteUnits = ['kB', 'MB', 'GB', 'TB']
        do {
            fileSizeInBytes= fileSizeInBytes / 2014;
            i++;
        } while (fileSizeInBytes > 1024);
        
        return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
    }

    return (
        <div className='fileItem'>
            <a href={fileUrl} target='_blank' download>
                <div className='fileItem--left'>
                    <InsertDriveFile />
                    <p>{caption}</p>
                </div>

                <div className='fileItem--right'>
                    {/* <p>{timestamp}</p> */}
                    <p>{getReadableFileSizeString(size)}</p>
                </div>
            </a>
        </div>
    )
}

export default FileItem
