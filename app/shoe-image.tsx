/* oxlint-disable next/no-img-element -- Local product photography with a reserved frame. */
import type { ImgHTMLAttributes } from 'react';
export default function ShoeImage({className='',alt='',...props}:ImgHTMLAttributes<HTMLImageElement>){return <span className={'shoe-image '+className} role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={!alt||undefined}><img {...props} src="/air-force-1-white.png" alt=""/></span>}
