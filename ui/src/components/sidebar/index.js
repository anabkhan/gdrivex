import { DeleteOutline, ImportantDevices, InsertDriveFile } from '@material-ui/icons'
import React from 'react'
import { NewFile } from './NewFile'
import { SideBarItem } from './SideBarItem'
import './../../styles/sidebar.css'

export const index = () => {
    return (
        <div className='sideBar'>
            <NewFile />
            <div className='sideBar__itemsContainer'>
                <SideBarItem arrow icon={(<InsertDriveFile/>)} label={'My Drive'} />
                <SideBarItem arrow icon={(<ImportantDevices/>)} label={'Computer'} />
                <SideBarItem arrow icon={(<DeleteOutline/>)} label={'Bin'} />
                <hr/>

            </div>
        </div>
    )
}

export default index
