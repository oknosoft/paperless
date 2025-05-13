import React from 'react';
import PropTypes from 'prop-types';
import Nom from '../Furn1/Nom';
import {ConditionalAppearanceContext, initialContext} from '../ConditionalAppearance/context';

class Noms extends React.Component {

  reps = new Set();

  registerRep = (el) => {
    if(el) {
      this.reps.add(el);
    }
  };

  handleSave() {
    for(const rep of this.reps) {
      const {_obj, cnstr} = rep.props;
      const row = _obj.production.get(0);
      row.characteristic = this.props.ox;
      row.elm = cnstr;
      rep.handleSave();
    }
  }

  render() {
    const {ox, cnstr, classes, editor} = this.props;
    const constructions = ox.constructions._obj.filter(({parent}) => parent === cnstr);

    return <div className={classes.workheight}>
      {constructions.map(({cnstr}) => {
        const layer = editor.project.getItem({cnstr});
        return <ConditionalAppearanceContext.Provider value={{...initialContext, ox, cnstr, editor, layer }}>
          <Nom
            key={`nom-${cnstr}`}
            ox={ox} cnstr={cnstr}
            registerRep={this.registerRep}
            complete_list_sorting={[19,30]}
            count={constructions.length}
          />
        </ConditionalAppearanceContext.Provider>;
      })}
    </div>;
  }

}

Noms.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
};

export default Noms;
