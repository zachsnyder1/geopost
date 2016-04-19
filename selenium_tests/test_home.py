import unittest
import os
import sys
PACKAGE_ROOT = '../..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), 
	os.path.expanduser(__file__))))
PACKAGE_PATH = os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_ROOT))
sys.path.append(PACKAGE_PATH)
from projects.selenium_tests.base_tests import BaseProjectsTests
from zachsite.selenium_tests.pages import LoginPage, LogoutPage
from geopost.selenium_tests.pages import GeopostHomePage, GeopostEntryPage
from selenium import webdriver


class HomeAnonymousTests(BaseProjectsTests, unittest.TestCase):
	"""
	Methods to test app homepage as anonymuos user.
	"""
	def setUp(self):
		"""
		Make the driver, get the page.
		"""
		self.driver = webdriver.Firefox()
		self.driver.get(GeopostHomePage.URL)
		self.page = GeopostHomePage(self.driver)
	
	def tearDown(self):
		"""
		Close driver.
		"""
		self.driver.close()
	
	def test_modal_open_and_close(self):
		"""
		Test that the info modal opens when an entry is clicked,
		and then closes when the close button is clicked.
		"""
		self.assertTrue(self.page.verify_entry_hidden())
		self.page.open_entry()
		self.assertTrue(self.page.verify_entry_displayed())
		self.page.dismiss_info()
		self.assertTrue(self.page.verify_entry_hidden())
	
	def test_info_displayed(self):
		"""
		Test that when an entry is clicked, the title and body
		elements of the info modal are populated with information,
		and that a photo is eventually loaded.
		"""
		# First, they should have no info:
		self.assertTrue(self.page.verify_title_empty())
		self.assertTrue(self.page.verify_body_empty())
		self.assertFalse(self.page.get_img_src())
		# Open an entry:
		self.page.open_entry()
		# Now the title and body should be present:
		self.assertTrue(self.page.verify_title_not_empty())
		self.assertTrue(self.page.verify_body_not_empty())
		# ...and the image should load in a few seconds:
		self.assertTrue(self.page.verify_img_load())
	
	def test_attribution_displayed(self):
		"""
		Test that the attribution is not displayed initially, and that it
		expands after click.
		"""
		self.assertTrue(self.page.verify_attribution_displayed())
	
	def test_auth_elements(self):
		"""
		Test that the server correctly omitted the toolbar and edit/delete
		buttons for anonymous user.
		"""
		self.assertTrue(self.page.verify_toolbar_absent())
		self.assertTrue(self.page.verify_edit_button_absent())
		self.assertTrue(self.page.verify_delete_button_absent())


class HomeAuthedTests(HomeAnonymousTests):
	"""
	Methods to test app home page as authed user.
	"""
	def setUp(self):
		"""
		Make driver, page, sign in.
		"""
		with open('/etc/zachsite_test_creds.txt') as f:
			testCreds = f.readlines()
		self.driver = webdriver.Firefox()
		self.driver.get(LoginPage.URL)
		self.page = LoginPage(self.driver)
		self.page.enter_username(testCreds[0].strip())
		self.page.enter_password(testCreds[1].strip())
		self.page.login()
		self.driver.get(GeopostHomePage.URL)
		self.page = GeopostHomePage(self.driver)
	
	def tearDown(self):
		"""
		Close driver.
		"""
		self.driver.get(LogoutPage.URL)
		self.page = LogoutPage(self.driver)
		self.assertTrue(self.page.verify_logged_out())
		self.driver.close()
	
	def test_auth_elements(self):
		"""
		Override: Test that the server included the toolbar and
		edit/delete buttons for the authenticated user.
		"""
		self.assertTrue(self.page.verify_toolbar_present())
		self.assertTrue(self.page.verify_edit_button_present())
		self.assertTrue(self.page.verify_delete_button_present())
	
	def test_toolbar_open_and_close(self):
		"""
		Make sure the toolbar opens and closes when toggled.
		"""
		self.assertTrue(self.page.verify_toolbar_displayed())
		self.page.toggle_toolbar()
		self.assertTrue(self.page.verify_toolbar_not_displayed())
		self.page.toggle_toolbar()
		self.assertTrue(self.page.verify_toolbar_displayed())
	
	def test_follow_new_entry_link(self):
		"""
		Click on the 'New Entry' button in the toolbar, verify that
		it leads to entry page.
		"""
		self.page.click_new_entry_button()
		self.page = GeopostEntryPage(self.driver)
		self.assertTrue(self.page.verify_path())
		

if __name__ == '__main__':
	unittest.main()