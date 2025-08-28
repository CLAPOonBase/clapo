import React from 'react'
import UserProfileClient from './UserProfileClient'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { userId } = await params
  
  return <UserProfileClient userId={userId} />
}

