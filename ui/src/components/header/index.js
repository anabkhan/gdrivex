import React from 'react'
import '../../styles/header.css'
import GDriveLogo from '../../media/google-drive-logo.svg'
import SearchIcon from '@material-ui/icons/Search'

const index = () => {
    return (
        <div className='header'>
            <div className='header__logo' >
                <img src={GDriveLogo} alt="" />
                <span>Drive</span>
            </div>
            <div className='header__searchContainer'>
                <div className="header__searchBar">
                    <SearchIcon/>
                    <input type='text' placeholder='Search in Drive'/>
                    {/* <ExpandMoreIcon/> */}
                </div>
            </div>
            <div className='header__icons' >

            </div>
        </div>
    )
}

export default index
