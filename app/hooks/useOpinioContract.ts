import { useContext } from 'react';
import { useOpinioContext } from '../Context/OpinioContext';

export const useOpinioContract = () => {
  return useOpinioContext();
};

