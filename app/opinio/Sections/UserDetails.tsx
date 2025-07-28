const UserDetails = () => {
    const user_id = '0000.....021212'; 
    const balance = 1000; 
  return <div>
    
       <div className='w-full rounded-md md:flex md:space-x-4 space-y-4 md:space-y-0 justify-between'>
        <div className='bg-dark-800 p-4 rounded-md w-full flex flex-col text-left'>
          <span className='text-2xl'>Hey, {user_id}</span>
          <span className='text-secondary'>Welcome back! Here&apos;s what trending in the markets.</span>
        </div>
        <div className='bg-dark-800 p-4 rounded-md w-full flex justify-between items-center'>
         <div className='flex flex-col items-start text-secondary'>
 <span>Balance</span>
          <span className='text-2xl text-white'>${balance}</span>
         </div>
          <div>
 <button className='bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition'>
  Make Deposit
 </button>
         </div>
        </div>
      </div>
  </div>
}

export default UserDetails