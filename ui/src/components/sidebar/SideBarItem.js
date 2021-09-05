import { ArrowRight } from '@material-ui/icons'
import React from 'react'
import './../../styles/sidebaritem.css'

export const SideBarItem = ({arrow, icon, label, onClick}) => {
    return (
        <div className='sideBarItem' onClick={onClick}>
            {/* <div className='sideBarItem__arrow'>
                {arrow && (<ArrowRight />)}
            </div> */}

            <div className='sideBarItem__main'>
                {icon}
                <p>{label}</p>
            </div>
        </div>
    )
}
