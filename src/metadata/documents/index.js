// модификаторы документов

// движение денег
//import doc_issue from "./doc_issue";

// индивидуальный документ безбумажки
import lines_availability from 'paperless-server/server/meta';
import FrmObj from '../../components/LinesAvailability/FrmObj';

export default function ($p) {
  //doc_issue($p);
  lines_availability($p);
  $p.doc.lines_availability.FrmObj = FrmObj;
}
