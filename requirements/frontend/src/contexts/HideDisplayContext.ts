import { createContext } from 'react';
import { HideDisplayData } from '../types/HideDisplayData';

const HideDisplayContext = createContext<[HideDisplayData, Function] | undefined>(undefined);

export default HideDisplayContext;