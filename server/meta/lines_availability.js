module.exports = {
  "name": "ДоступностьЛиний",
  "splitted": false,
  "synonym": "Доступность линий",
  "illustration": "",
  "obj_presentation": "",
  "list_presentation": "",
  "input_by_string": [
    "number_doc"
  ],
  "hierarchical": false,
  "has_owners": false,
  "group_hierarchy": false,
  "main_presentation_name": false,
  "code_length": 9,
  "id": "",
  "fields": {},
  "tabular_sections": {
    "work_centers": {
      "name": "РабочиеЦентры",
      "synonym": "Линии",
      "tooltip": "",
      "fields": {
        "work_center": {
          "synonym": "Линия",
          "multiline_mode": false,
          "tooltip": "",
          "choice_groups_elm": "groups",
          "type": {
            "types": [
              "cat.work_centers"
            ],
            "is_ref": true
          }
        }
      }
    }
  },
  "cachable": "events"
};
