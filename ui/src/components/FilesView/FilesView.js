import React, {useState, useEffect} from 'react'
import {db} from '../../firebase'
import FileItem from './FileItem'
import '../../styles/FilesView.css';
import { FileCard } from './FileCard';

export const FilesView = () => {
    const [files, setFiles] = useState([])

    useEffect(() => {
        db.collection('myFiles').onSnapshot(snapshot => {
            console.log('got the files', snapshot)
            setFiles(snapshot.docs.map(doc => ({
                id:doc.id,
                item:doc.data()
            })))
        })
    }, [])

    return (
        <div className='filesView'>
            {/* <div className='filesView__row'>
                {
                    files.slice(0,5).map(({id,item})=>(
                        <FileCard name={item.caption} />
                    ))
                }
            </div> */}

            <div className='filesView__titles'>
                <div className='filesView__titles--left'>
                    <p>Name</p>
                </div>

                <div className='filesView__titles--right'>
                    {/* <p>Last Modified</p> */}
                    <p>File size</p>
                </div>
            </div>
            {
                files.map(({id, item}) => (
                    <FileItem id={id} caption={item.caption} fileUrl={item.fileUrl} size={item.size} timestamp={item.timestamp} />
                ))
            }
        </div>
    )
}
