import { InsertDriveFile } from '@material-ui/icons'
import React from 'react'
import '../../styles/FileCard.css'

export const FileCard = ({name}) => {
    return (
        <div className='fileCard'>
            <div className='fileCard--top'>
                <InsertDriveFile style={{fontSize: 130}} />
            </div>

            <div className='fileCard--bottom'>
                <p>{name}</p>
            </div>
        </div>
    )
}
