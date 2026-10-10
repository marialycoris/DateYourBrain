# Pretend PyMySQL is MySQLdb so Django's MySQL backend works without a C driver.
import pymysql

pymysql.version_info = (1, 4, 6, 'final', 0)
pymysql.install_as_MySQLdb()