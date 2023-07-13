
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {Helmet} from 'react-helmet';
import {description} from '../App/menu';

const ltitle = 'Статистика';

function Monitor({handleIfaceState}) {

  const [totals, setTotals] = React.useState(0);

  React.useEffect(() => {
    handleIfaceState({
      component: '',
      name: 'title',
      value: ltitle,
    });

    const sse = new EventSource('/adm/api/scan/monitor?feed=eventsource&place=glass');
    function onScan({data}) {
      try {
        const {totals} = JSON.parse(data).data;
        setTotals(totals);
      }
      catch (e) {}
    }
    sse.addEventListener('scan', onScan, false);

    return () => sse.close();
  }, []);

  return (
    <>
      <Helmet title={ltitle}>
        <meta name="description" content={description} />
      </Helmet>

      <Typography variant="h2" style={{fontSize: '20em'}}>
        {totals.pad(3)}
      </Typography>
    </>
  );
}

Monitor.propTypes = {
  handleNavigate: PropTypes.func.isRequired,
  handleIfaceState: PropTypes.func.isRequired,
};


export default Monitor;
