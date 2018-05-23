// общие модули

// строки интернационализации
import i18ru from "./i18n.ru";
import Editor from "./Editor";

export default function ($p) {
  i18ru($p);
  Editor($p);
}
