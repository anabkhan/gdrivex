import React from 'react'
import DriveItem from './DriveItem'
import '../../styles/DrivesView.css'
import { Add } from '@material-ui/icons'

export const DrivesView = () => {
    return (
        <div className='drivesView'>
            <div className='drivesView--header'>
                <p style={{fontWeight:'500', fontSize:'x-large'}}>Drives</p>
                <span style={{marginLeft:'50px', color:'rgb(51, 103, 214)', fontWeight:'bold', display:'flex', cursor:'pointer'}}>
                    <Add style={{color:'rgb(51, 103, 214)'}}/>
                    Add New Drive</span>
            </div>
            <DriveItem email={'akanabkhan@gmail.com'} capacity={15} status={'connected'} />
        </div>
    )
}
