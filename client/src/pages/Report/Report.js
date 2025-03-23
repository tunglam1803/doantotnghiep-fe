import { Box } from '@mui/material';
import Bar from '../bar';
import Pie from '../pie';
import styles from './Report.module.scss'
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
const Report = () => {
  return (
    <section className={cx('wrapper')}>
    <Box 
        height="91.85vh" 
        marginLeft="304px"
    >
      <Pie/>
      <Bar/>
    </Box>
    </section>
  );
};

export default Report;
