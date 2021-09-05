import React from 'react'
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import '../../styles/DriveItem.css'

const DriveItem = ({email,capacity, usedPercentage, status}) => {
    return (
        <div className='driveItem' style={{background:`linear-gradient(to right, #5a53536e ${usedPercentage}%, #202124 0%)`}}>
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
