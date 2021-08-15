import React, {useState, useEffect} from 'react'
import {db} from '../../firebase'
import FileItem from './FileItem'
import '../../styles/FilesView.css';
import { FileCard } from './FileCard';
import { get } from '../../services/RestService';
import { LIST_FILES } from '../../constants/REST_URLS';

export const FilesView = () => {
    const [files, setFiles] = useState([])

    const fetchFiles = () => {
        get(LIST_FILES).then((response) => {
            const keys = Object.keys(response.data);
            const files = [];
            keys.forEach(key => {
                const eachFile = response.data[key].file;
                files.push({
                    id: eachFile.name,
                    item: eachFile
                })
            });
            setFiles(files)
            console.log('files', files)
        }).catch((err) => {
            console.log(err);
            alert(err);
        })
    }

    useEffect(() => {
        fetchFiles();
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

            {/* <div className='filesView__titles'>
                <div className='filesView__titles--left'>
                    <p>Name</p>
                </div>

                <div className='filesView__titles--right'>
                    <p>File size</p>

                    <p>Action</p>
                </div>
            </div> */}
            {
                files.map(({id, item}) => (
                    <FileItem id={id} caption={item.name} size={item.size} timestamp={item.timestamp} onDeleted={fetchFiles} />
                ))
            }
        </div>
    )
}
