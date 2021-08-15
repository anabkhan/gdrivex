import { DeleteOutline, ImportantDevices, InsertDriveFile } from '@material-ui/icons'
import React from 'react'
import { NewFile } from './NewFile'
import { SideBarItem } from './SideBarItem'
import './../../styles/sidebar.css'
import CloudIcon from '@material-ui/icons/Cloud';

export const index = () => {
    return (
        <div className='sideBar'>
            <NewFile />
            <div className='sideBar__itemsContainer'>
                <SideBarItem arrow icon={(<InsertDriveFile/>)} label={'Files'} />
                <SideBarItem arrow icon={(<CloudIcon/>)} label={'Drives'} />
                <SideBarItem arrow icon={(<DeleteOutline/>)} label={'Bin'} />
                <hr/>

            </div>
        </div>
    )
}

export default index
