import { useState, forwardRef } from 'react';
import classNames from 'classnames';

import images from '~/assets/images';
import styles from './Image.module.scss';

const Image = forwardRef(
  ({ src, alt, className, fallback: customFallback = images.noAvatar, onClick, ...props }, ref) => {
    const [fallback, setFallBack] = useState();

    const hanldError = () => {
      setFallBack(customFallback);
    };

    return (
      <img
        ref={ref}
        className={classNames(styles.wrapper, className)}
        src={fallback || src}
        {...props}
        alt={alt}
        onClick={onClick}
        onError={hanldError}
      />
    );
  },
);

export default Image;
