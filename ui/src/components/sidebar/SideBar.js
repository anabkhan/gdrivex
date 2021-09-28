import { DeleteOutline, ImportantDevices, InsertDriveFile } from '@material-ui/icons'
import React from 'react'
import { NewFile } from './NewFile'
import { SideBarItem } from './SideBarItem'
import './../../styles/sidebar.css'
import CloudIcon from '@material-ui/icons/Cloud';

export const SideBar = ({ onItemSelected }) => {

    const [itemSelected, setItemSelected] = React.useState('FILES');

    return (
        <div className='sideBar'>
            <NewFile />
            <div className='sideBar__itemsContainer'>
                <span style={{borderLeft: itemSelected === 'FILES' ? '4px solid' : 'unset', display:'block', cursor:'pointer'}}>
                    <SideBarItem arrow icon={(<InsertDriveFile />)} label={'Files'} onClick={() => {onItemSelected('FILES'); setItemSelected('FILES')}} />
                </span>
                <span></span>
                <span style={{borderLeft: itemSelected === 'DRIVES' ? '4px solid' : 'unset', display:'block', cursor:'pointer'}}>
                    <SideBarItem arrow icon={(<CloudIcon />)} label={'Drives'} onClick={() => {onItemSelected('DRIVES'); setItemSelected('DRIVES')}} />
                </span>
                {/* <SideBarItem arrow icon={(<DeleteOutline/>)} label={'Bin'} /> */}
                {/* <hr /> */}

            </div>
        </div>
    )
}

export default SideBar
