import AddService from './AddService';
import PropTypes from 'prop-types';

const EditService = ({ themeMode }) => {
  return <AddService themeMode={themeMode} isEditMode={true} />;
};

EditService.propTypes = {
  themeMode: PropTypes.string
};

export default EditService; 