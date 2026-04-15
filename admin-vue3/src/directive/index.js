import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import submitNoEnter from './common/submitNoEnter'

export default function directive(app) {
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('noEnter', submitNoEnter)
}
