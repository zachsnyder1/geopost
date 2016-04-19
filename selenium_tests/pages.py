import os
import sys
from .locators import HomeLocators, EntryLocators
PACKAGE_ROOT = '../..'
SCRIPT_DIR = os.path.dirname(os.path.realpath(os.path.join(os.getcwd(), 
	os.path.expanduser(__file__))))
PACKAGE_PATH = os.path.normpath(os.path.join(SCRIPT_DIR, PACKAGE_ROOT))
sys.path.append(PACKAGE_PATH)
from zachsite.selenium_tests.base_page import BasePage
from projects.selenium_tests.pages import ProjectsBasePage
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC


class GeopostPageBase(ProjectsBasePage):
	"""
	Defines methods common to both home page and entry page
	of the app.
	"""
	# ---------------------------------------------------------------
	# ---------------------- GENERAL ACTION(S) ----------------------
	# ---------------------------------------------------------------
	def toggle_toolbar(self):
		"""
		Click the toolbar collapse/expand button.
		"""
		tlbrToggle = self.get_element_if_visible(HomeLocators.TOOLBAR_TOGGLE)
		tlbrToggle.click()
	
	# ---------------------------------------------------------------
	# ------------------- VERIFICATION METHODS ----------------------
	# ---------------------------------------------------------------
	def verify_attribution_displayed(self):
		"""
		Wait for attribution to be displayed.
		"""
		attribution = self.driver.find_element(*HomeLocators.ATTRIBUTION)
		c = 'ol-collapsed' # the class indicating that attr is collapsed
		condition = lambda driver: c not in attribution.get_attribute('class')
		return self.verify(condition)
	
	def verify_toolbar_present(self):
		"""
		Wait for toolbar to be present.
		"""
		condition = EC.presence_of_element_located(HomeLocators.TOOLBAR)
		return self.verify(condition)
	
	def verify_toolbar_absent(self):
		"""
		True if toolbar is absent.
		"""
		return self.absent(HomeLocators.TOOLBAR)
	
	def verify_toolbar_displayed(self):
		"""
		True if toolbar is present and visible.
		"""
		toolbar = self.driver.find_element(*HomeLocators.TOOLBAR)
		return self.verify(EC.visibility_of(toolbar))
	
	def verify_toolbar_not_displayed(self):
		"""
		True if toolbar is present and visible.
		"""
		condition = EC.invisibility_of_element_located(HomeLocators.TOOLBAR)
		return self.verify(condition)
	
	

class GeopostHomePage(GeopostPageBase):
	"""
	Page objects for Geopost home page.
	"""
	EXPECTED_PATH = '/projects/geopost/'
	# ---------------------------------------------------------------
	# ---------------------- GENERAL ACTIONS ------------------------
	# ---------------------------------------------------------------
	def get_img_src(self):
		"""
		Get the src attribute of the entry img element.
		"""
		elem = self.get_element_if_present(HomeLocators.ENTRY_IMG)
		return elem.get_attribute('src')
	
	def open_entry(self):
		"""
		Click on an entry in the map to display its content.
		"""
		script = '$(document).ready(function() {' + \
			'var feat = OL_OBJ.entriessource.getFeatures()[0];' + \
			'OL_OBJ.select.getFeatures().push(feat);' + \
			'OL_OBJ.select.dispatchEvent(\'select\');' + \
			'});'
		self.driver.execute_script(script)
	
	def delete_by_title(self, title):
		"""
		Find the entry by title, delete if exists.
		"""
		script = '$(document).ready(function() {' + \
			'var feats = OL_OBJ.entriessource.getFeatures();' + \
			'for (var i = 0; i < feats.length; i++) {' + \
			'if (feats[i].get("title") == "' + title + '") {' + \
			'OL_OBJ.select.getFeatures().push(feats[i]);}}' + \
			'OL_OBJ.select.dispatchEvent(\'select\');' + \
			'$("#delete-btn").click();' + \
			'});'
		self.driver.execute_script(script)
	
	def edit_by_title(self, title):
		"""
		Find the entry by title, click edit button.
		"""
		script = '$(document).ready(function() {' + \
			'var feats = OL_OBJ.entriessource.getFeatures();' + \
			'for (var i = 0; i < feats.length; i++) {' + \
			'if (feats[i].get("title") == "' + title + '") {' + \
			'OL_OBJ.select.getFeatures().push(feats[i]);}}' + \
			'OL_OBJ.select.dispatchEvent(\'select\');' + \
			'$("#edit-btn").click();' + \
			'});'
		self.driver.execute_script(script)
	
	def dismiss_info(self):
		"""
		Close the info modal.
		"""
		closebtn = self.get_element_if_visible(HomeLocators.CLOSE_BTN)
		closebtn.click()
	
	def click_new_entry_button(self):
		"""
		Click the 'New Entry' button in the toolbar.
		"""
		newEntryBtn = self.driver.find_elements(*HomeLocators.TOOLBAR_BTNS)[0]
		newEntryBtn.click()
	
	# ---------------------------------------------------------------
	# ------------------- VERIFICATION METHODS ----------------------
	# ---------------------------------------------------------------
	def verify_entry_exists_by_title(self, title, time=1):
		"""
		Verify that an entry exists with a title that matches the
		given title.
		"""
		# Try to find entry with same title using JavasSript,
		# append a flag div element to the body if one is found:
		id = EntryLocators.ENTRY_FOUND_FLAG[1]
		script = '$(document).ready(function() {' + \
			'var feats = OL_OBJ.entriessource.getFeatures();' + \
			'for (var i = 0; i < feats.length; i++) {' + \
			'if (feats[i].get("title") == "' + title + '") {' + \
			'$(\'<div id="' + id +  '"></div>\').appendTo($("body"));}}' + \
			'});'
		self.driver.execute_script(script)
		# Using webdriver, try to find flag for a second,
		# if not found, then success
		return self.get_element_if_present(
			EntryLocators.ENTRY_FOUND_FLAG,
			time=time
		)
	
	def verify_entry_displayed(self):
		"""
		Return True if info modal is displayed.
		"""
		info = self.driver.find_element(*HomeLocators.INFO_MODAL)
		return self.verify(EC.visibility_of(info))
	
	def verify_entry_hidden(self):
		"""
		Return True if info modal is not displayed.
		"""
		condition = EC.invisibility_of_element_located(HomeLocators.INFO_MODAL)
		return self.verify(condition)
	
	def verify_title_empty(self):
		"""
		Wait for title to be empty. 
		""" 
		title = self.driver.find_element(*HomeLocators.ENTRY_TITLE)
		return self.verify(lambda driver: title.text == '')
	
	def verify_title_not_empty(self):
		"""
		Wait for title to be not empty.
		"""
		title = self.driver.find_element(*HomeLocators.ENTRY_TITLE)
		return self.verify(lambda driver: title.text != '')
	
	def verify_body_empty(self):
		"""
		Wait for body to be empty.
		"""
		body = self.driver.find_element(*HomeLocators.ENTRY_BODY)
		return self.verify(lambda driver: body.text == '')
	
	def verify_body_not_empty(self):
		"""
		Wait for body to be not empty.
		"""
		body = self.driver.find_element(*HomeLocators.ENTRY_BODY)
		return self.verify(lambda driver: body.text != '')
	
	def verify_img_load(self):
		"""
		Wait for the image to load.
		"""
		return self.verify(lambda driver: self.get_img_src() != '', time=8)
	
	def verify_edit_button_present(self):
		"""
		Wait for edit button to be present.
		"""
		condition = EC.presence_of_element_located(HomeLocators.EDIT_BTN)
		return self.verify(condition)
	
	def verify_edit_button_absent(self):
		"""
		True if edit button is absent.
		"""
		return self.absent(HomeLocators.EDIT_BTN)
	
	def verify_delete_button_present(self):
		"""
		Wait for delete button to be present.
		"""
		condition = EC.presence_of_element_located(HomeLocators.DELETE_BTN)
		return self.verify(condition)
	
	def verify_delete_button_absent(self):
		"""
		True if delete button is absent.
		"""
		return self.absent(HomeLocators.DELETE_BTN)

GeopostHomePage.URL = BasePage.DOMAIN + GeopostHomePage.EXPECTED_PATH


class GeopostEntryPage(GeopostPageBase):
	"""
	Page Objects for entry page.
	"""
	EXPECTED_PATH = '/projects/geopost/entry/'
	# ---------------------------------------------------------------
	# ---------------------- GENERAL ACTIONS ------------------------
	# ---------------------------------------------------------------
	def toggle_draw(self):
		"""
		Click draw button.
		"""
		drawBtn = self.get_element_if_visible(EntryLocators.DRAW_BTN)
		drawBtn.click()
	
	def toggle_modify(self):
		"""
		Click modify button.
		"""
		modBtn = self.get_element_if_visible(EntryLocators.MODIFY_BTN)
		modBtn.click()
	
	def draw_point(self):
		"""
		Click somewhere on the map.
		"""
		action = ActionChains(self.driver)
		map = self.get_element_if_visible(EntryLocators.MAP)
		xOffset = map.size['width'] / 2
		yOffset = map.size['height'] / 2
		action.move_to_element_with_offset(map, xOffset, yOffset)
		action.click()
		action.perform()
	
	def enter_title(self, title):
		"""
		Send title to title input.
		"""
		titleIn = self.get_element_if_visible(EntryLocators.TITLE_IN)
		titleIn.clear()
		titleIn.send_keys(title)
	
	def get_title(self):
		"""
		Get the current value of the title input.
		"""
		titleIn = self.get_element_if_visible(EntryLocators.TITLE_IN)
		return titleIn.get_attribute('value')
	
	def enter_body(self, body):
		"""
		Send body to body input.
		"""
		bodyIn = self.get_element_if_visible(EntryLocators.BODY_IN)
		bodyIn.clear()
		bodyIn.send_keys(body)
	
	def get_body(self):
		"""
		Get the current value of the body input.
		"""
		bodyIn = self.get_element_if_visible(EntryLocators.BODY_IN)
		return bodyIn.get_attribute('value')
	
	def choose_photo(self, absPath):
		"""
		Choose a photo.
		"""
		photoIn = self.get_element_if_visible(EntryLocators.PHOTO_IN)
		photoIn.clear()
		photoIn.send_keys(absPath)
	
	def submit_form(self):
		"""
		Click the dummy submit button.
		"""
		dummySubmit = self.get_element_if_visible(EntryLocators.DUMMY_SUBMIT)
		dummySubmit.click()
	
	# ---------------------------------------------------------------
	# ------------------- VERIFICATION METHODS ----------------------
	# ---------------------------------------------------------------
	def verify_draw_active(self):	
		"""
		True if draw interaction is active.
		"""
		draw = self.driver.find_element(*EntryLocators.DRAW_BTN)
		classStr = draw.get_attribute('class')
		condition = lambda driver: (EntryLocators.ACTIVE in classStr and 
			EntryLocators.INACTIVE not in classStr)
		return self.verify(condition)
	
	def verify_draw_not_active(self):
		"""
		True if draw interaction is not active.
		"""
		draw = self.driver.find_element(*EntryLocators.DRAW_BTN)
		classStr = draw.get_attribute('class')
		condition = lambda driver: (EntryLocators.ACTIVE not in classStr and 
			EntryLocators.INACTIVE in classStr)
		return self.verify(condition)
	
	def verify_modify_active(self):
		"""
		True if modify interaction is active.
		"""
		modify = self.driver.find_element(*EntryLocators.MODIFY_BTN)
		classStr = modify.get_attribute('class')
		condition = lambda driver: (EntryLocators.ACTIVE in classStr and 
			EntryLocators.INACTIVE not in classStr)
		return self.verify(condition)
	
	def verify_modify_not_active(self):
		"""
		True if modify interaction is not active.
		"""
		modify = self.driver.find_element(*EntryLocators.MODIFY_BTN)
		classStr = modify.get_attribute('class')
		condition = lambda driver: (EntryLocators.ACTIVE not in classStr and 
			EntryLocators.INACTIVE in classStr)
		return self.verify(condition)

GeopostEntryPage.URL = BasePage.DOMAIN + GeopostEntryPage.EXPECTED_PATH
