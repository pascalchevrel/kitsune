from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium_tests.core.base_page import BasePage


class SubmitKBArticlePage(BasePage):
    __kb_article_for_contributors_sidebar = (By.XPATH, "//nav[@id='for-contributors-sidebar']")
    __kb_article_form_title = (By.XPATH, "//input[@id='id_title']")
    __kb_article_form_slug = (By.XPATH, "//input[@id='id_slug']")
    __kb_article_category_select = (By.XPATH, "//select[@id='id_category']")
    __kb_article_is_localizable_checkbox = (By.XPATH, "//input[@id='id_is_localizable']")

    __kb_article_allow_discussions_on_article = (By.XPATH, "//input[@id='id_allow_discussion']")
    __kb_article_search_for_related_documents = (By.XPATH, "//input[@id='search-related']")
    __kb_article_keywords_input = (By.XPATH, "//input[@id='id_keywords']")
    __kb_article_search_result_summary_textarea = (By.XPATH, "//textarea[@id='id_summary']")
    # try
    __kb_article_content_textarea = (By.XPATH, "//textarea[@id='id_content'][1]")
    __kb_article_insert_media = (By.XPATH, "//button[contains(@class, 'btn-media')]")
    __kb_article_insert_media_modal_images = (By.XPATH, "//div[@id='media-modal']//img")
    __kb_article_insert_media_modal_insert_button = (
        By.XPATH,
        "//button[contains(text(), 'Insert Media')]",
    )
    __kb_article_toggle_syntax_highlighting = (
        By.XPATH,
        "//a[contains(text(), 'Toggle syntax highlight')]",
    )
    __kb_article_expiry_date = (By.XPATH, "//input[@id='id_expires']")
    __kb_article_preview_content_button = (
        By.XPATH,
        "//div[contains(@class, 'submit')]/button[contains(@class, " "'btn-preview')]",
    )
    __kb_article_preview_image = (By.XPATH, "//div[@id='doc-content']//img")
    __kb_article_submit_for_preview_button = (
        By.XPATH,
        "//div[contains(@class, 'submit')]/button[contains(@class, " "'submit')]",
    )
    __kb_article_preview_content = (By.XPATH, "//div[@id='doc-content']")
    __kb_article_showfor_panel = (By.XPATH, "//section[@id='showfor-panel']")
    __kb_submit_changes_input_field = (By.XPATH, "//input[@id='id_comment']")
    __kb_submit_changes_button = (By.XPATH, "//button[@id='submit-document-form']")

    def __init__(self, driver: WebDriver):
        super().__init__(driver)

    def is_for_contributors_section_displayed(self) -> bool:
        return super()._is_element_displayed(self.__kb_article_for_contributors_sidebar)

    def add_text_to_article_form_title_field(self, text: str):
        super()._type(self.__kb_article_form_title, text)

    def add_text_to_related_documents_field(self, text: str):
        super()._type(self.__kb_article_search_for_related_documents, text)

    def add_text_to_keywords_field(self, text: str):
        super()._type(self.__kb_article_keywords_input, text)

    def add_text_to_search_result_summary_field(self, text: str):
        super()._type(self.__kb_article_search_result_summary_textarea, text)

    def add_text_to_expiry_date_field(self, text: str):
        super()._type(self.__kb_article_expiry_date, text)

    def add_text_to_changes_description_field(self, text: str):
        super()._type(self.__kb_submit_changes_input_field, text)

    def add_text_to_content_textarea(self, text: str):
        super()._type(self.__kb_article_content_textarea, text)

    def is_content_textarea_displayed(self) -> bool:
        return super()._is_element_displayed(self.__kb_article_content_textarea)

    def click_on_insert_media_button(self):
        super()._click(self.__kb_article_insert_media)

    def click_on_toggle_syntax_highlight_option(self):
        super()._click(self.__kb_article_toggle_syntax_highlighting)

    def click_on_preview_content_button(self):
        super()._click(self.__kb_article_preview_content_button)

    def click_on_submit_for_review_button(self):
        super()._click(self.__kb_article_submit_for_preview_button)

    def click_on_changes_submit_button(self):
        super()._click(self.__kb_submit_changes_button)

    def is_showfor_panel_displayed(self) -> bool:
        return super()._is_element_displayed(self.__kb_article_showfor_panel)

    def is_preview_content_section_displayed(self) -> bool:
        return super()._is_element_displayed(self.__kb_article_preview_content)

    def _click_on_a_relevant_to_option_checkbox(self, option_to_click: str):
        xpath = (
            By.XPATH,
            f"//div[@id='id_products']//label[contains(text(), '{option_to_click}')]/input",
        )
        super()._click(xpath)

    def _get_text_of_label_for_relevant_to_checkbox(self, option_to_click) -> str:
        xpath = (
            By.XPATH,
            f"//div[@id='id_products']//input[@id='id_products_{option_to_click}']/..",
        )
        return super()._get_text_of_element(xpath)

    def _click_on_a_particular_parent_topic(self, parent_topic: str):
        xpath_parent_topic = (
            By.XPATH,
            f"//section[@id='accordion']//button[text()='{parent_topic}']",
        )
        super()._click(xpath_parent_topic)

    def _click_on_a_particular_child_topic_checkbox(
        self, parent_topic: str, child_topic_checkbox: str
    ):
        xpath_child_topic_checkbox_option = (
            By.XPATH,
            f"//section[@id='accordion']//button[text()='{parent_topic}']"
            f"/parent::h3/following-sibling::ul[1]"
            f"//label[text()='{child_topic_checkbox}']",
        )
        super()._click(xpath_child_topic_checkbox_option)

    def _click_on_insert_media_textarea_option(self):
        super()._click(self.__kb_article_insert_media)

    def _click_on_first_image_from_media_panel(self):
        super()._click(self.__kb_article_insert_media_modal_images)

    def _click_on_insert_media_modal_button(self):
        super()._click(self.__kb_article_insert_media_modal_insert_button)

    def select_category_option_by_text(self, option: str):
        super()._select_option_by_text(self.__kb_article_category_select, option)
