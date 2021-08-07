import React from 'react'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import '../../styles/DriveItem.css'

const DriveItem = ({email,capacity, status}) => {
    return (
        <div className='driveItem'>
            <div className='driveItem--left'>
                <p>{email}</p>
            </div>

            <div className='driveItem--right'>
                {
                    status == 'connected' ? (
                        <>
                        <CheckCircleIcon style={{color:'green'}} />
                        </>
                    ) : (
                        <>
                        <ErrorOutlineIcon />
                        </>
                    )
                }
                <div className='driveItem-capacity'>
                    <p>{capacity}</p>
                </div>
            </div>
        </div>
    )
}

export default DriveItem
