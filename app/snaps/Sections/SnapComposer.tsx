"use client"
import { Camera, Video, FileText, Calendar,PencilLineIcon } from 'lucide-react'

export default function SnapComposer() {
  return (
    <div className="my-4 rounded-md bg-dark-800 ">
      <div className="flex space-x-4 py-4">
       
        <div className='w-full'>
            <div className='flex justify-center items-center border-b px-4 mb-4 border-secondary'>
                <PencilLineIcon className='text-secondary'/>
              <textarea
            placeholder="What's happening?"
            className="w-full bg-transparent p-4  text-lg placeholder-secondary outline-none resize-none"
            rows={1}
            
          />
            </div>
        <div className="flex-1 w-full justify-between">
       
          <div className="flex justify-between items-center">
          <div className="flex w-full justify-between text-secondary items-center">
  <span className="flex flex-1 items-center justify-center gap-2">
    <Camera className="w-5 h-5 cursor-pointer" /> Photo
  </span>
  <span className="flex flex-1 items-center justify-center gap-2">
    <Video className="w-5 h-5 cursor-pointer" /> Camera
  </span>
  <span className="flex flex-1 items-center justify-center gap-2">
    <FileText className="w-5 h-5 cursor-pointer" /> File
  </span>
  <span className="flex flex-1 items-center justify-center gap-2">
    <Calendar className="w-5 h-5 cursor-pointer" /> Event
  </span>
</div>

          </div>
        </div>
        </div>
         
      </div>
    </div>
  )
}