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
from geopost.selenium_tests.pages import GeopostEntryPage, GeopostHomePage
from selenium import webdriver


class EntryTests(BaseProjectsTests, unittest.TestCase):
    """
    Methods to test the entry page of the app (create/edit/delete).
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
        self.driver.get(GeopostEntryPage.URL)
        self.page = GeopostEntryPage(self.driver)

    def tearDown(self):
        """
        Close driver.
        """
        self.driver.get(LogoutPage.URL)
        self.page = LogoutPage(self.driver)
        self.assertTrue(self.page.verify_logged_out())
        self.driver.close()

    def test_attribution_displayed(self):
        """
        Test that the attribution is displayed initially, and that it
        collapses after click.
        """
        self.assertTrue(self.page.verify_attribution_displayed())

    def test_toolbar_open_and_close(self):
        """
        Make sure the toolbar opens and closes when toggled.
        """
        self.assertTrue(self.page.verify_toolbar_displayed())
        self.page.toggle_toolbar()
        self.assertTrue(self.page.verify_toolbar_not_displayed())
        self.page.toggle_toolbar()
        self.assertTrue(self.page.verify_toolbar_displayed())

    def test_toggle_draw(self):
        """
        Turn draw interaction on and off.
        """
        self.assertTrue(self.page.verify_draw_not_active())
        self.page.toggle_draw()
        self.assertTrue(self.page.verify_draw_active())
        self.page.toggle_draw()
        self.assertTrue(self.page.verify_draw_not_active())

    def test_toggle_modify(self):
        """
        Turn modify on and off.
        """
        # first draw a point so that modify button is present
        self.page.toggle_draw()
        self.page.draw_point()
        self.assertTrue(self.page.verify_modify_not_active())
        self.page.toggle_modify()
        self.assertTrue(self.page.verify_modify_active())
        self.page.toggle_modify()
        self.assertTrue(self.page.verify_modify_not_active())

    def test_create_new_entry_and_delete(self):
        """
        Draw point, fill in form, submit.
        """
        # read parameter file
        with open(SCRIPT_DIR + '/data_new_entry_valid.csv') as f:
            testData = f.readlines()
        # run subtests
        for paramList in testData:
            params = paramList.split(',')
            with self.subTest(params=params):
                # reload page for each subtest
                self.driver.get(GeopostEntryPage.URL)
                self.page = GeopostEntryPage(self.driver)
                # enter details and submit
                self.page.toggle_draw()
                self.page.draw_point()
                self.page.enter_title(params[0])
                self.page.enter_body(params[1])
                self.page.choose_photo(SCRIPT_DIR + params[2].strip())
                self.page.submit_form()
                # verify that entry was created successfully
                self.page = GeopostHomePage(self.driver)
                self.assertTrue(self.page.verify_path(time=8))
                self.assertTrue(
                        self.page.verify_entry_exists_by_title(params[0])
                )
                # Delete the newly created post
                self.page.delete_by_title(params[0])
                # Verify that the delete worked
                self.driver.get(GeopostHomePage.URL)
                self.assertTrue(self.page.verify_path(time=8))
                self.assertFalse(
                        self.page.verify_entry_exists_by_title(params[0])
                )

    def test_create_edit_delete(self):
        """
        Create a point, edit it, delete it.
        """
        # read parameter file
        with open(SCRIPT_DIR + '/data_edit_entry_valid.csv') as f:
            testData = f.readlines()
        # run subtests
        for paramList in testData:
            params = paramList.split(',')
            with self.subTest(params=params):
                # reload page for each subtest
                self.driver.get(GeopostEntryPage.URL)
                self.page = GeopostEntryPage(self.driver)
                # make new entry
                self.page.toggle_draw()
                self.page.draw_point()
                self.page.enter_title(params[0])
                self.page.enter_body(params[1])
                self.page.choose_photo(SCRIPT_DIR + params[2].strip())
                self.page.submit_form()
                # verify that entry was created successfully
                self.page = GeopostHomePage(self.driver)
                self.assertTrue(self.page.verify_path(time=12))
                self.assertTrue(
                        self.page.verify_entry_exists_by_title(params[0])
                )
                # edit the entry
                self.page.edit_by_title(params[0])
                self.page = GeopostEntryPage(self.driver)
                self.assertTrue(self.page.verify_path(time=8))
                self.assertEqual(self.page.get_title(), params[0])
                self.assertEqual(self.page.get_body(), params[1])
                self.page.draw_point()
                self.page.enter_title(params[3])
                self.page.enter_body(params[4])
                self.page.choose_photo(SCRIPT_DIR + params[5].strip())
                self.page.submit_form()
                # verify that entry was edited successfully
                self.page = GeopostHomePage(self.driver)
                self.assertTrue(self.page.verify_path(time=8))
                self.assertTrue(
                        self.page.verify_entry_exists_by_title(params[3])
                )
                # Delete the newly created post
                self.page.delete_by_title(params[3])
                # Verify that the delete worked
                self.assertFalse(
                        self.page.verify_entry_exists_by_title(params[3])
                )


if __name__ == '__main__':
    unittest.main()
